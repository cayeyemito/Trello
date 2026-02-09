import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/src/components/ui/button";
import { SortableTaskCard } from "@/src/components/kanban/SortableTaskCard";
import { type Task, type TaskStatus } from "@/src/types";
import { cn } from "@/src/lib/utils";

type ColumnProps = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onCreate: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
  highlightMap: Record<string, string[]>;
};

export function Column({
  id,
  title,
  tasks,
  onCreate,
  onEdit,
  onDelete,
  onMove,
  highlightMap,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            {title}
          </h3>
          <p className="text-[11px] text-slate-500">{tasks.length} tareas</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCreate(id)}
          aria-label={`Crear tarea en ${title}`}
        >
          + Crear
        </Button>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[120px] rounded-xl border border-slate-800/70 bg-slate-900/40 p-3 transition-colors duration-200 ease-out",
          isOver && "border-blue-500/60 bg-slate-900/70 ring-1 ring-blue-500/20"
        )}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.length === 0 && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-center text-xs text-slate-400">
                <p>Sin tareas en {title}.</p>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => onCreate(id)}
                >
                  Crear tarea
                </Button>
              </div>
            )}
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
                highlightFields={highlightMap[task.id] ?? []}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
