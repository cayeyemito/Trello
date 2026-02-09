import * as React from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por texto, tag:fx, p:high, due:overdue, est:>=120"
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Ayuda
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-xs font-semibold text-slate-700">Ejemplos</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li>`tag:fx p:high`</li>
            <li>`due:overdue est:&lt;60`</li>
            <li>`volatilidad model`</li>
            <li>`tag:bonos due:week`</li>
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
