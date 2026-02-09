import * as React from "react";
import { Switch } from "@/src/components/ui/switch";

type GodModeSwitchProps = {
  enabled: boolean;
  onToggle: (value: boolean) => void;
};

export function GodModeSwitch({ enabled, onToggle }: GodModeSwitchProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">Modo Dios</p>
        <p className="text-xs text-slate-500">
          Activa observaciones y rúbricas de evaluación.
        </p>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}
