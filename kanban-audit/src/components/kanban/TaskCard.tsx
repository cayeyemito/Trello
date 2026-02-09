import * as React from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { MoveSelect } from "@/src/components/kanban/MoveSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { type Task, type TaskStatus } from "@/src/types";
import { cn } from "@/src/lib/utils";

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
  highlightFields?: string[];
  isDragging?: boolean;
};

const priorityLabel: Record<Task["prioridad"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  highlightFields = [],
  isDragging,
}: TaskCardProps) {
  const dueLabel = task.fechaLimite
    ? new Date(task.fechaLimite).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      })
    : "Sin fecha límite";

  const highlight = (field: string) =>
    highlightFields.includes(field) ? "ring-1 ring-amber-300/70" : "";

  return (
    <Card
      className={cn(
        "space-y-3 border-slate-800 bg-slate-900/80 p-4 shadow-[0_12px_28px_-20px_rgba(0,0,0,0.9)]",
        isDragging && "opacity-60 ring-2 ring-blue-400"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-slate-100">
            {task.titulo}
          </h4>
          {task.descripcion && (
            <p className="text-xs text-slate-400">{task.descripcion}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={task.prioridad} className={highlight("prioridad")}>
            {priorityLabel[task.prioridad]}
          </Badge>
          <span className="text-xs text-slate-400">{task.estimacionMin} min</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {task.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[11px]">
            #{tag}
          </Badge>
        ))}
        {task.tags.length === 0 && (
          <span className="text-xs text-slate-500">Sin tags</span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className={highlight("fechaLimite")}>{dueLabel}</span>
        {task.rubrica?.score !== undefined && (
          <Badge
            variant="default"
            className={cn(
              "bg-slate-950 text-slate-100",
              highlight("rubrica")
            )}
          >
            Rúbrica {task.rubrica.score}/10
          </Badge>
        )}
      </div>
      {task.observacionesJavi && (
        <div
          className={cn(
            "rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-200",
            highlight("observacionesJavi")
          )}
        >
          <strong>Obs. Javi:</strong> {task.observacionesJavi}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(task)}
            aria-label={`Editar ${task.titulo}`}
          >
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                aria-label={`Borrar ${task.titulo}`}
              >
                Borrar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar tarea</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se registrará en la auditoría.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="min-w-[120px]">
          <MoveSelect
            value={task.estado}
            onChange={(status) => onMove(task, status)}
            label={`Mover ${task.titulo}`}
          />
        </div>
      </div>
    </Card>
  );
}
