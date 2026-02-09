import * as React from "react";
import { Switch } from "@/src/components/ui/switch";

type GodModeSwitchProps = {
  enabled: boolean;
  onToggle: (value: boolean) => void;
};

export function GodModeSwitch({ enabled, onToggle }: GodModeSwitchProps) {
  return (
    <div
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]"
      role="button"
      aria-pressed={enabled}
      tabIndex={0}
      onClick={() => onToggle(!enabled)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle(!enabled);
        }
      }}
    >
      <div>
        <p className="text-sm font-semibold text-slate-100">Modo Dios</p>
        <p className="text-xs text-slate-400">
          Activa observaciones y rúbricas de evaluación.
        </p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
