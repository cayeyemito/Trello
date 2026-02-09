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
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{tasks.length} tareas</p>
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
          "min-h-[120px] rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 transition-colors",
          isOver && "border-emerald-300 bg-emerald-50/40"
        )}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {tasks.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
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
