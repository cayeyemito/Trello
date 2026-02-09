import * as React from "react";
import { Badge } from "@/src/components/ui/badge";

type GodModeFieldsProps = {
  observaciones?: string;
  rubricaScore?: number;
};

export function GodModeFields({ observaciones, rubricaScore }: GodModeFieldsProps) {
  if (!observaciones && rubricaScore === undefined) return null;
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      {observaciones && (
        <Badge variant="outline">Obs. Javi</Badge>
      )}
      {rubricaScore !== undefined && (
        <Badge variant="default">Rúbrica {rubricaScore}/10</Badge>
      )}
    </div>
  );
}
