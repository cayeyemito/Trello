import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { type TaskStatus } from "@/src/types";

type MoveSelectProps = {
  value: TaskStatus;
  onChange: (next: TaskStatus) => void;
  label?: string;
};

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "doing", label: "Doing" },
  { value: "done", label: "Done" },
];

export function MoveSelect({ value, onChange, label }: MoveSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as TaskStatus)}>
      <SelectTrigger aria-label={label ?? "Mover tarea"} className="h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
