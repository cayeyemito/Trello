import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { TimeTravelButton } from "@/src/components/audit/TimeTravelButton";
import { summarizeDiff } from "@/src/lib/audit";
import { type AuditEvent } from "@/src/types";

type AuditTableProps = {
  events: AuditEvent[];
  onTimeTravel: (index: number) => void;
};

const actionVariant: Record<AuditEvent["accion"], "default" | "outline" | "low" | "medium" | "high"> = {
  CREATE: "low",
  UPDATE: "medium",
  DELETE: "high",
  MOVE: "outline",
  IMPORT: "default",
  RESOLVE_DUPLICATE_ID: "outline",
};

export function AuditTable({ events, onTimeTravel }: AuditTableProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        Sin eventos aún. Crea o mueve tareas para ver auditoría.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Acción</TableHead>
          <TableHead>Task ID</TableHead>
          <TableHead>Diff</TableHead>
          <TableHead>Experimental</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event, index) => (
          <TableRow key={`${event.timestamp}-${event.taskId}-${index}`}>
            <TableCell className="text-xs text-slate-400">
              {new Date(event.timestamp).toLocaleString("es-ES", {
                timeZone: "UTC",
              })}
            </TableCell>
            <TableCell>
              <Badge variant={actionVariant[event.accion]}>{event.accion}</Badge>
            </TableCell>
            <TableCell className="text-xs font-mono text-slate-300">
              {event.taskId}
            </TableCell>
            <TableCell className="text-xs text-slate-300">
              {summarizeDiff(event.diff)}
            </TableCell>
            <TableCell>
              <TimeTravelButton onConfirm={() => onTimeTravel(index)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
