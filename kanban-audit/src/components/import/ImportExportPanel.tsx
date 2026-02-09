import * as React from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";
import { type AppState } from "@/src/types";

type ImportExportPanelProps = {
  onExport: () => void;
  onImport: (jsonText: string) => void;
  importErrors: string[];
  exampleState: AppState;
};

export function ImportExportPanel({
  onExport,
  onImport,
  importErrors,
  exampleState,
}: ImportExportPanelProps) {
  const [value, setValue] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    setValue(text);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Importar JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Pega el JSON exportado aquí"
          />
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => onImport(value)}>Importar</Button>
              </TooltipTrigger>
              <TooltipContent>Importar estado desde el texto JSON.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" onClick={onExport}>
                  Exportar JSON
                </Button>
              </TooltipTrigger>
              <TooltipContent>Descargar el estado actual.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cargar archivo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Seleccionar un archivo JSON.</TooltipContent>
            </Tooltip>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
          {importErrors.length > 0 && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
              <p className="font-semibold">Errores de importación</p>
              <ul className="mt-2 list-disc pl-4">
                {importErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo de schema</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] text-slate-100">
            {JSON.stringify(exampleState, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
