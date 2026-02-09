import { v4 as uuidv4 } from "uuid";
import { AppStateSchema, type AppState, type AuditEvent, type Task } from "@/src/types";
import { createAuditEvent } from "@/src/lib/audit";

export const STORAGE_KEY = "kanban-audit-state-v1";

export const defaultState: AppState = {
  tasks: [],
  audit: [],
  ui: { godMode: false, lastMovedTaskId: undefined, lastMovedAt: undefined },
};

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;
  try {
    const parsed = JSON.parse(raw);
    const result = AppStateSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
  } catch {
    return defaultState;
  }
  return defaultState;
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportStateToFile(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `kanban-audit-export-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function parseAndValidateImport(jsonText: string): {
  state?: AppState;
  errors?: string[];
} {
  try {
    const parsed = JSON.parse(jsonText);
    const result = AppStateSchema.safeParse(parsed);
    if (result.success) {
      return { state: result.data };
    }
    return {
      errors: result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      ),
    };
  } catch (error) {
    return { errors: [error instanceof Error ? error.message : "JSON inválido"] };
  }
}

export function resolveDuplicateIds(
  tasks: Task[]
): { tasks: Task[]; events: AuditEvent[]; duplicates: number } {
  const seen = new Set<string>();
  const events: AuditEvent[] = [];
  const nextTasks = tasks.map((task) => {
    if (!seen.has(task.id)) {
      seen.add(task.id);
      return task;
    }
    const newId = uuidv4();
    const updated = { ...task, id: newId };
    seen.add(newId);
    events.push(
      createAuditEvent({
        accion: "RESOLVE_DUPLICATE_ID",
        taskId: newId,
        before: task,
        after: updated,
        note: `duplicate-id resolved: ${task.id} -> ${newId}`,
      })
    );
    return updated;
  });

  return { tasks: nextTasks, events, duplicates: events.length };
}
