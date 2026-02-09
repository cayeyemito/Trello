import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/src/components/kanban/TaskCard";
import { type Task, type TaskStatus } from "@/src/types";

type SortableTaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
  highlightFields?: string[];
};

export function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  highlightFields,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ?? "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    zIndex: isDragging ? 40 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
        highlightFields={highlightFields}
        isDragging={isDragging}
      />
    </div>
  );
}
