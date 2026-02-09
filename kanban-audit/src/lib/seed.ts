import { type Task } from "@/src/types";

export const seedTasks: Task[] = [
  {
    id: "7f9b2e9c-7b5f-4f2c-9d5f-58c4a6f5c0a1",
    titulo: "Rebalanceo cartera LATAM vs. FX risk",
    descripcion:
      "Actualizar pesos de cartera por volatilidad de MXN y BRL. Revisar límites internos.",
    prioridad: "high",
    tags: ["rebalance", "fx", "riesgo"],
    estimacionMin: 180,
    fechaCreacion: "2026-02-05T09:20:00.000Z",
    fechaLimite: "2026-02-10T16:00:00.000Z",
    estado: "todo",
  },
  {
    id: "f8a011a0-66b8-4b66-9c43-4c2ed29a3f4e",
    titulo: "Validar señales de volatilidad intradía",
    descripcion:
      "Comparar señales del modelo VIX-local con alertas del desk US.",
    prioridad: "medium",
    tags: ["modelo", "volatilidad", "alertas"],
    estimacionMin: 90,
    fechaCreacion: "2026-02-06T13:15:00.000Z",
    fechaLimite: "2026-02-11T14:00:00.000Z",
    estado: "doing",
  },
  {
    id: "1e2bd0b4-0f05-41d4-8e2b-3a6d9ac3b1f8",
    titulo: "Cerrar posición táctica en energy",
    descripcion:
      "Cerrar 60% de la exposición en energy para liberar margen antes del reporte.",
    prioridad: "high",
    tags: ["energy", "riesgo", "margen"],
    estimacionMin: 60,
    fechaCreacion: "2026-02-04T11:00:00.000Z",
    fechaLimite: "2026-02-09T18:00:00.000Z",
    estado: "doing",
  },
  {
    id: "8ab4aa2b-5c33-4c11-bf8b-7c9a4dc55b0a",
    titulo: "Actualizar límites de exposición por cliente",
    descripcion:
      "Revisar concentración en dos clientes institucionales y ajustar límites.",
    prioridad: "low",
    tags: ["compliance", "clientes"],
    estimacionMin: 120,
    fechaCreacion: "2026-02-02T10:00:00.000Z",
    fechaLimite: "2026-02-12T12:00:00.000Z",
    estado: "todo",
  },
  {
    id: "c9a7a62b-4ff8-4f76-8f6c-7c2ff1b5b40f",
    titulo: "Post-mortem de operación fallida en bonos",
    descripcion:
      "Documentar root cause, impacto, y plan de mitigación para el comité.",
    prioridad: "medium",
    tags: ["postmortem", "bonos"],
    estimacionMin: 150,
    fechaCreacion: "2026-01-31T09:40:00.000Z",
    fechaLimite: "2026-02-13T15:00:00.000Z",
    estado: "todo",
  },
  {
    id: "bb3d7640-0d4a-4d2f-83d3-5e0a34de71e1",
    titulo: "Ajustar stop-loss dinámico en cartera tech",
    descripcion:
      "Recalcular stops usando la nueva banda de volatilidad semanal.",
    prioridad: "high",
    tags: ["tech", "stops", "volatilidad"],
    estimacionMin: 75,
    fechaCreacion: "2026-02-03T08:30:00.000Z",
    fechaLimite: "2026-02-09T20:00:00.000Z",
    estado: "done",
  },
  {
    id: "d1fb1d2a-b3a2-4d63-9e2a-6b28f6d0b2b7",
    titulo: "Preparar briefing para apertura Asia",
    descripcion:
      "Resumen de macro, FX y eventos de earnings para el handoff.",
    prioridad: "low",
    tags: ["briefing", "macro"],
    estimacionMin: 45,
    fechaCreacion: "2026-02-07T06:30:00.000Z",
    fechaLimite: "2026-02-10T05:30:00.000Z",
    estado: "done",
  },
  {
    id: "4a2f7b3b-0d68-43b5-8f76-9b1fbc5a6f88",
    titulo: "Revisar correlaciones cripto/FX",
    descripcion:
      "Actualizar dashboard y generar nota para equipo de riesgo.",
    prioridad: "medium",
    tags: ["cripto", "fx", "dashboard"],
    estimacionMin: 110,
    fechaCreacion: "2026-02-01T12:15:00.000Z",
    fechaLimite: "2026-02-14T17:00:00.000Z",
    estado: "todo",
  },
];
