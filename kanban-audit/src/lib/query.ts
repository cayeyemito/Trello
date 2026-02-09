import { type Task } from "@/src/types";

export type DueFilter = "overdue" | "week";

export type EstComparator = {
  op: "<" | "<=" | ">" | ">=" | "=";
  value: number;
};

export type ParsedQuery = {
  textTerms: string;
  filters: {
    tags: string[];
    priority?: Task["prioridad"];
    due?: DueFilter;
    estComparator?: EstComparator;
  };
};

const PRIORITY_MAP: Record<string, Task["prioridad"]> = {
  low: "low",
  medium: "medium",
  high: "high",
};

export function parseQuery(input: string): ParsedQuery {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  const filters: ParsedQuery["filters"] = { tags: [] };
  const textTerms: string[] = [];

  for (const token of tokens) {
    if (token.startsWith("tag:")) {
      const tag = token.slice(4).trim();
      if (tag) filters.tags.push(tag.toLowerCase());
      continue;
    }

    if (token.startsWith("p:")) {
      const priorityRaw = token.slice(2).toLowerCase();
      const priority = PRIORITY_MAP[priorityRaw];
      if (!priority) {
        throw new Error(`Prioridad inválida: ${priorityRaw}`);
      }
      filters.priority = priority;
      continue;
    }

    if (token.startsWith("due:")) {
      const due = token.slice(4).toLowerCase();
      if (due !== "overdue" && due !== "week") {
        throw new Error(`Filtro due inválido: ${due}`);
      }
      filters.due = due;
      continue;
    }

    if (token.startsWith("est:")) {
      const raw = token.slice(4);
      const match = raw.match(/^(<=|>=|=|<|>)(\d+)$/);
      if (!match) {
        throw new Error(`Comparador est inválido: ${raw}`);
      }
      filters.estComparator = {
        op: match[1] as EstComparator["op"],
        value: Number(match[2]),
      };
      continue;
    }

    textTerms.push(token);
  }

  return {
    textTerms: textTerms.join(" "),
    filters,
  };
}

export function applyQuery(tasks: Task[], parsed: ParsedQuery): Task[] {
  const now = new Date();
  const inWeek = new Date(now);
  inWeek.setDate(now.getDate() + 7);

  const filtered = tasks.filter((task) => {
    const terms = parsed.textTerms.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      const haystack = `${task.titulo} ${task.descripcion ?? ""}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return false;
    }

    if (parsed.filters.tags.length > 0) {
      const taskTags = task.tags.map((tag) => tag.toLowerCase());
      if (!parsed.filters.tags.every((tag) => taskTags.includes(tag))) {
        return false;
      }
    }

    if (parsed.filters.priority && task.prioridad !== parsed.filters.priority) {
      return false;
    }

    if (parsed.filters.due) {
      if (!task.fechaLimite) return false;
      const dueDate = new Date(task.fechaLimite);
      if (parsed.filters.due === "overdue" && dueDate >= now) return false;
      if (parsed.filters.due === "week" && (dueDate < now || dueDate > inWeek)) {
        return false;
      }
    }

    if (parsed.filters.estComparator) {
      const { op, value } = parsed.filters.estComparator;
      if (op === "<" && !(task.estimacionMin < value)) return false;
      if (op === "<=" && !(task.estimacionMin <= value)) return false;
      if (op === ">" && !(task.estimacionMin > value)) return false;
      if (op === ">=" && !(task.estimacionMin >= value)) return false;
      if (op === "=" && !(task.estimacionMin === value)) return false;
    }

    return true;
  });

  const priorityOrder: Record<Task["prioridad"], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return filtered.sort((a, b) => {
    const priorityDiff = priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
    if (priorityDiff !== 0) return priorityDiff;
    const dueA = a.fechaLimite ? new Date(a.fechaLimite).getTime() : Infinity;
    const dueB = b.fechaLimite ? new Date(b.fechaLimite).getTime() : Infinity;
    return dueA - dueB;
  });
}
