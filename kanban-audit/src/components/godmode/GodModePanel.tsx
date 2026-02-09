import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { type Task } from "@/src/types";

type GodModePanelProps = {
  tasks: Task[];
  onEvaluate: (task: Task) => void;
};

export function GodModePanel({ tasks, onEvaluate }: GodModePanelProps) {
  const scored = tasks.filter((task) => task.rubrica?.score !== undefined);
  const avg =
    scored.length > 0
      ? scored.reduce((acc, task) => acc + (task.rubrica?.score ?? 0), 0) /
        scored.length
      : 0;
  const pending = tasks.filter((task) => task.rubrica?.score === undefined);
  const withObservations = tasks.filter(
    (task) => task.observacionesJavi && task.observacionesJavi.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel de rúbricas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Media scores</p>
            <p className="text-lg font-semibold text-slate-900">
              {avg.toFixed(1)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Sin evaluar</p>
            <p className="text-lg font-semibold text-slate-900">
              {pending.length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Evaluadas</p>
            <p className="text-lg font-semibold text-slate-900">
              {scored.length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sin evaluar
          </p>
          {pending.length === 0 && (
            <p className="text-sm text-slate-500">Todo evaluado.</p>
          )}
          {pending.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <span className="text-slate-700">{task.titulo}</span>
              <Button size="sm" onClick={() => onEvaluate(task)}>
                Evaluar
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Observaciones Javi
          </p>
          {withObservations.length === 0 && (
            <p className="text-sm text-slate-500">Sin observaciones aún.</p>
          )}
          {withObservations.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900"
            >
              <p className="font-semibold">{task.titulo}</p>
              <p>{task.observacionesJavi}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
