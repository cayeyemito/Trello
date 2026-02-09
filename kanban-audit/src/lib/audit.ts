import { type AuditEvent, type AuditDiff, type Task } from "@/src/types";

export function computeTaskDiff(
  before: Task | undefined,
  after: Task | undefined
): AuditDiff {
  if (!before && !after) {
    return {};
  }

  if (!before && after) {
    return { after };
  }

  if (before && !after) {
    return { before };
  }

  const beforeDiff: Partial<Record<keyof Task, Task[keyof Task]>> = {};
  const afterDiff: Partial<Record<keyof Task, Task[keyof Task]>> = {};
  const keys = Object.keys(before ?? {}) as (keyof Task)[];

  for (const key of keys) {
    const prev = before?.[key];
    const next = after?.[key];
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      beforeDiff[key] = prev;
      afterDiff[key] = next;
    }
  }

  return { before: beforeDiff as Partial<Task>, after: afterDiff as Partial<Task> };
}

export function createAuditEvent(params: {
  accion: AuditEvent["accion"];
  taskId: string;
  before?: Task;
  after?: Task;
  note?: string;
}): AuditEvent {
  const diff = computeTaskDiff(params.before, params.after);
  if (params.note) {
    diff.note = params.note;
  }
  return {
    timestamp: new Date().toISOString(),
    accion: params.accion,
    taskId: params.taskId,
    userLabel: "Alumno/a",
    diff,
  };
}

export function logEvent<T extends { audit: AuditEvent[] }>(
  state: T,
  event: AuditEvent
): T {
  return {
    ...state,
    audit: [...state.audit, event],
  };
}

export function summarizeDiff(diff: AuditDiff) {
  const keys = new Set<string>();
  Object.keys(diff.before ?? {}).forEach((key) => keys.add(key));
  Object.keys(diff.after ?? {}).forEach((key) => keys.add(key));
  if (keys.size === 0 && diff.note) {
    const [summary] = diff.note.split("||");
    return summary.trim();
  }
  return Array.from(keys).join(", ");
}

export function reverseApplyEvent(
  tasks: Task[],
  event: AuditEvent
): Task[] {
  if (event.accion === "CREATE") {
    return tasks.filter((task) => task.id !== event.taskId);
  }

  if (event.accion === "DELETE") {
    const before = event.diff.before;
    if (!before) return tasks;
    return [...tasks, before as Task];
  }

  if (event.accion === "IMPORT") {
    if (!event.diff.note) return tasks;
    const [, payload] = event.diff.note.split("||");
    if (!payload) return tasks;
    try {
      const parsed = JSON.parse(payload) as { prevTasks?: Task[] };
      if (parsed.prevTasks) {
        return parsed.prevTasks;
      }
    } catch {
      return tasks;
    }
    return tasks;
  }

  const index = tasks.findIndex((task) => task.id === event.taskId);
  if (index === -1) return tasks;
  const current = tasks[index];
  const before = event.diff.before ?? {};
  const reverted = { ...current, ...before } as Task;
  return [
    ...tasks.slice(0, index),
    reverted,
    ...tasks.slice(index + 1),
  ];
}
