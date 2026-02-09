import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "@/src/components/kanban/Column";
import { type Task, type TaskStatus } from "@/src/types";

type BoardProps = {
  tasks: Task[];
  onCreate: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
  highlightMap: Record<string, string[]>;
};

const columns: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
];

export function Board({
  tasks,
  onCreate,
  onEdit,
  onDelete,
  onMove,
  highlightMap,
}: BoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter((task) => task.estado === column.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;
    const task = tasks.find((item) => item.id === active.id);
    if (!task) return;
    const overId = over.id as string;
    const nextColumn = columns.find((column) => column.id === overId);
    if (nextColumn) {
      onMove(task, nextColumn.id);
      return;
    }
    const overTask = tasks.find((item) => item.id === overId);
    if (overTask && overTask.estado !== task.estado) {
      onMove(task, overTask.estado);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasksByStatus[column.id]}
            onCreate={onCreate}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
            highlightMap={highlightMap}
          />
        ))}
      </div>
    </DndContext>
  );
}
