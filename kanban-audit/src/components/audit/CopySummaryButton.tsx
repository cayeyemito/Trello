import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import { type AuditEvent } from "@/src/types";

type CopySummaryButtonProps = {
  events: AuditEvent[];
};

export function CopySummaryButton({ events }: CopySummaryButtonProps) {
  const handleCopy = async () => {
    const counts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.accion] = (acc[event.accion] ?? 0) + 1;
      return acc;
    }, {});
    const lastEvents = events.slice(-10).reverse();
    const lines = [
      "Resumen de auditoría",
      "--------------------",
      ...Object.entries(counts).map(([action, count]) => `${action}: ${count}`),
      "",
      "Últimos 10 eventos:",
      ...lastEvents.map(
        (event) =>
          `${event.timestamp} | ${event.accion} | ${event.taskId} | ${event.diff.note ?? ""}`
      ),
      "",
      `Total tasks afectadas: ${new Set(events.map((event) => event.taskId)).size}`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Resumen copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el resumen");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" onClick={handleCopy}>
          Copiar resumen
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copiar resumen del log de auditoría.</TooltipContent>
    </Tooltip>
  );
}
