import { z } from "zod";

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export const TaskStatusSchema = z.enum(["todo", "doing", "done"]);

export const RubricaSchema = z.object({
  score: z.number().min(0).max(10),
  comentario: z.string().optional(),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(3),
  descripcion: z.string().optional(),
  prioridad: TaskPrioritySchema,
  tags: z.array(z.string()),
  estimacionMin: z.number().min(0),
  fechaCreacion: z.string(),
  fechaLimite: z.string().optional(),
  estado: TaskStatusSchema,
  observacionesJavi: z.string().optional(),
  rubrica: RubricaSchema.optional(),
});

export const AuditDiffSchema = z.object({
  before: TaskSchema.partial().optional(),
  after: TaskSchema.partial().optional(),
  note: z.string().optional(),
});

export const AuditEventSchema = z.object({
  timestamp: z.string(),
  accion: z.enum([
    "CREATE",
    "UPDATE",
    "DELETE",
    "MOVE",
    "IMPORT",
    "RESOLVE_DUPLICATE_ID",
  ]),
  taskId: z.string(),
  userLabel: z.literal("Alumno/a"),
  diff: AuditDiffSchema,
});

export const AppStateSchema = z.object({
  tasks: z.array(TaskSchema),
  audit: z.array(AuditEventSchema),
  ui: z.object({
    godMode: z.boolean(),
    lastMovedTaskId: z.string().optional(),
    lastMovedAt: z.string().optional(),
  }),
});

export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type Rubrica = z.infer<typeof RubricaSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type AuditDiff = z.infer<typeof AuditDiffSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AppState = z.infer<typeof AppStateSchema>;
