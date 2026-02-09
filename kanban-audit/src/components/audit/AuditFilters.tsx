import * as React from "react";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { type AuditEvent } from "@/src/types";

type AuditFiltersProps = {
  actionFilter: AuditEvent["accion"] | "ALL";
  taskFilter: string;
  searchFilter: string;
  onActionChange: (value: AuditEvent["accion"] | "ALL") => void;
  onTaskFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
};

const actions: (AuditEvent["accion"] | "ALL")[] = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
  "MOVE",
  "IMPORT",
  "RESOLVE_DUPLICATE_ID",
];

export function AuditFilters({
  actionFilter,
  taskFilter,
  searchFilter,
  onActionChange,
  onTaskFilterChange,
  onSearchChange,
}: AuditFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div>
        <label className="text-xs font-medium text-slate-600">Acción</label>
        <Select value={actionFilter} onValueChange={(value) => onActionChange(value as AuditEvent["accion"] | "ALL")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {action === "ALL" ? "Todas" : action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Task ID</label>
        <Input
          value={taskFilter}
          onChange={(event) => onTaskFilterChange(event.target.value)}
          placeholder="Filtrar por taskId"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Búsqueda rápida</label>
        <Input
          value={searchFilter}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar en diff o nota"
        />
      </div>
    </div>
  );
}
