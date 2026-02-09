"use client";

import * as React from "react";
import { toast } from "sonner";
import { Board } from "@/src/components/kanban/Board";
import { TaskDialog } from "@/src/components/kanban/TaskDialog";
import { AuditFilters } from "@/src/components/audit/AuditFilters";
import { AuditTable } from "@/src/components/audit/AuditTable";
import { CopySummaryButton } from "@/src/components/audit/CopySummaryButton";
import { GodModeSwitch } from "@/src/components/godmode/GodModeSwitch";
import { GodModePanel } from "@/src/components/godmode/GodModePanel";
import { ImportExportPanel } from "@/src/components/import/ImportExportPanel";
import { SearchBar } from "@/src/components/search/SearchBar";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { applyQuery, parseQuery, type ParsedQuery } from "@/src/lib/query";
import { createAuditEvent, logEvent, reverseApplyEvent } from "@/src/lib/audit";
import {
  defaultState,
  exportStateToFile,
  loadState,
  parseAndValidateImport,
  resolveDuplicateIds,
  saveState,
  STORAGE_KEY,
} from "@/src/lib/storage";
import { seedTasks } from "@/src/lib/seed";
import { type AppState, type AuditEvent, type Task, type TaskStatus } from "@/src/types";

type Action =
  | { type: "CREATE_TASK"; payload: { task: Task } }
  | { type: "UPDATE_TASK"; payload: { task: Task } }
  | { type: "DELETE_TASK"; payload: { taskId: string } }
  | { type: "MOVE_TASK"; payload: { taskId: string; status: TaskStatus } }
  | { type: "TOGGLE_GODMODE"; payload: { value: boolean } }
  | { type: "HYDRATE_STATE"; payload: { state: AppState } }
  | {
      type: "IMPORT_STATE";
      payload: {
        state: AppState;
        note: string;
        duplicateEvents: AuditEvent[];
        prevTasks: Task[];
        mode: "import" | "time-travel";
      };
    };

const initialAudit = createAuditEvent({
  accion: "IMPORT",
  taskId: "SYSTEM",
  note: `Seed inicial (${seedTasks.length} tareas)||${JSON.stringify({
    prevTasks: [],
  })}`,
});

const initialState: AppState = {
  tasks: seedTasks,
  audit: [initialAudit],
  ui: { godMode: false },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CREATE_TASK": {
      const next = {
        ...state,
        tasks: [...state.tasks, action.payload.task],
      };
      return logEvent(
        next,
        createAuditEvent({
          accion: "CREATE",
          taskId: action.payload.task.id,
          after: action.payload.task,
        })
      );
    }
    case "UPDATE_TASK": {
      const prev = state.tasks.find((task) => task.id === action.payload.task.id);
      if (!prev) return state;
      const nextTasks = state.tasks.map((task) =>
        task.id === action.payload.task.id ? action.payload.task : task
      );
      const next = { ...state, tasks: nextTasks };
      return logEvent(
        next,
        createAuditEvent({
          accion: "UPDATE",
          taskId: action.payload.task.id,
          before: prev,
          after: action.payload.task,
        })
      );
    }
    case "DELETE_TASK": {
      const prev = state.tasks.find((task) => task.id === action.payload.taskId);
      if (!prev) return state;
      const next = {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
      };
      return logEvent(
        next,
        createAuditEvent({
          accion: "DELETE",
          taskId: action.payload.taskId,
          before: prev,
        })
      );
    }
    case "MOVE_TASK": {
      const prev = state.tasks.find((task) => task.id === action.payload.taskId);
      if (!prev || prev.estado === action.payload.status) return state;
      const updated = { ...prev, estado: action.payload.status };
      const nextTasks = state.tasks.map((task) =>
        task.id === updated.id ? updated : task
      );
      const next = { ...state, tasks: nextTasks };
      return logEvent(
        next,
        createAuditEvent({
          accion: "MOVE",
          taskId: updated.id,
          before: prev,
          after: updated,
        })
      );
    }
    case "TOGGLE_GODMODE": {
      return { ...state, ui: { ...state.ui, godMode: action.payload.value } };
    }
    case "HYDRATE_STATE": {
      return action.payload.state;
    }
    case "IMPORT_STATE": {
      const incoming = action.payload.state;
      if (action.payload.mode === "time-travel") {
        const next = {
          ...incoming,
          ui: { ...incoming.ui, godMode: state.ui.godMode },
        };
        return logEvent(
          next,
          createAuditEvent({
            accion: "UPDATE",
            taskId: "SYSTEM",
            note: action.payload.note,
          })
        );
      }
      const importNote = `${action.payload.note}||${JSON.stringify({
        prevTasks: action.payload.prevTasks,
      })}`;
      const importEvent = createAuditEvent({
        accion: "IMPORT",
        taskId: "SYSTEM",
        note: importNote,
      });
      return {
        tasks: incoming.tasks,
        ui: incoming.ui,
        audit: [...incoming.audit, ...action.payload.duplicateEvents, importEvent],
      };
    }
    default:
      return state;
  }
}

export default function Home() {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");
  const [searchValue, setSearchValue] = React.useState("");
  const [parsedQuery, setParsedQuery] = React.useState<ParsedQuery>(() =>
    parseQuery("")
  );
  const [importErrors, setImportErrors] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [dialogTask, setDialogTask] = React.useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = React.useState<TaskStatus>("todo");

  const [actionFilter, setActionFilter] = React.useState<
    AuditEvent["accion"] | "ALL"
  >("ALL");
  const [taskFilter, setTaskFilter] = React.useState("");
  const [searchFilter, setSearchFilter] = React.useState("");

  React.useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  React.useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setHydrated(true);
      return;
    }
    const stored = loadState();
    if (stored.tasks.length > 0 || stored.audit.length > 0 || stored.ui.godMode) {
      dispatch({ type: "HYDRATE_STATE", payload: { state: stored } });
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem("kanban-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("kanban-theme", theme);
  }, [theme]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    try {
      setParsedQuery(parseQuery(value));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Query inválida";
      toast.error(message);
    }
  };

  const filteredTasks = React.useMemo(
    () => applyQuery(state.tasks, parsedQuery),
    [state.tasks, parsedQuery]
  );

  const handleCreate = (status: TaskStatus) => {
    setDialogMode("create");
    setDialogTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setDialogMode("edit");
    setDialogTask(task);
    setDefaultStatus(task.estado);
    setDialogOpen(true);
  };

  const handleSubmit = ({ task, isNew }: { task: Task; isNew: boolean }) => {
    dispatch({
      type: isNew ? "CREATE_TASK" : "UPDATE_TASK",
      payload: { task },
    });
    toast.success(isNew ? "Tarea creada" : "Tarea actualizada");
    setDialogOpen(false);
  };

  const handleDelete = (task: Task) => {
    dispatch({ type: "DELETE_TASK", payload: { taskId: task.id } });
    toast.success("Tarea eliminada");
  };

  const handleMove = (task: Task, status: TaskStatus) => {
    if (task.estado === status) return;
    dispatch({ type: "MOVE_TASK", payload: { taskId: task.id, status } });
    toast.success(`Movida a ${status}`);
  };

  const handleImport = (jsonText: string) => {
    const result = parseAndValidateImport(jsonText);
    if (!result.state) {
      setImportErrors(result.errors ?? ["Error desconocido"]);
      toast.error("Importación fallida");
      return;
    }
    const resolved = resolveDuplicateIds(result.state.tasks);
    const note = `Importadas ${result.state.tasks.length} tareas, duplicadas resueltas ${resolved.duplicates}`;
    dispatch({
      type: "IMPORT_STATE",
      payload: {
        state: {
          ...result.state,
          tasks: resolved.tasks,
        },
        note,
        duplicateEvents: resolved.events,
        prevTasks: state.tasks,
        mode: "import",
      },
    });
    setImportErrors([]);
    toast.success("Importación completa");
  };

  const handleExport = () => {
    exportStateToFile(state);
    toast.success("JSON exportado");
  };

  const filteredAudit = state.audit.filter((event) => {
    if (actionFilter !== "ALL" && event.accion !== actionFilter) return false;
    if (taskFilter && !event.taskId.includes(taskFilter)) return false;
    if (searchFilter) {
      const haystack = `${event.diff.note ?? ""} ${JSON.stringify(
        event.diff.before ?? {}
      )} ${JSON.stringify(event.diff.after ?? {})}`.toLowerCase();
      if (!haystack.includes(searchFilter.toLowerCase())) return false;
    }
    return true;
  });

  const highlightMap = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    for (let i = state.audit.length - 1; i >= 0; i -= 1) {
      const event = state.audit[i];
      if (event.accion === "UPDATE" && event.taskId !== "SYSTEM") {
        if (!map[event.taskId]) {
          const fields = new Set<string>();
          Object.keys(event.diff.before ?? {}).forEach((key) => fields.add(key));
          Object.keys(event.diff.after ?? {}).forEach((key) => fields.add(key));
          map[event.taskId] = Array.from(fields);
        }
      }
    }
    return map;
  }, [state.audit]);

  if (!hydrated) {
    return null;
  }

  const handleTimeTravel = (index: number) => {
    const targetEvents = state.audit.slice(0, index + 1);
    const toRevert = state.audit.slice(index + 1).reverse();
    let nextTasks = [...state.tasks];
    toRevert.forEach((event) => {
      nextTasks = reverseApplyEvent(nextTasks, event);
    });

    dispatch({
      type: "IMPORT_STATE",
      payload: {
        state: {
          tasks: nextTasks,
          audit: targetEvents,
          ui: { godMode: state.ui.godMode },
        },
        note: `time travel hasta ${new Date(
          state.audit[index].timestamp
        ).toLocaleString("es-ES")}`,
        duplicateEvents: [],
        prevTasks: state.tasks,
        mode: "time-travel",
      },
    });
    toast.success("Time travel aplicado");
  };

  return (
    <div className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-8 flex flex-col gap-6 border-b border-slate-800/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Kanban Audit Lab
          </p>
          <h1 className="text-3xl font-semibold text-slate-100">
            Control operativo de trading
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Tablero para operaciones críticas con auditoría detallada, búsqueda
            avanzada y modo de revisión.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => handleCreate("todo")}>Nueva tarea</Button>
          <Button
            variant="outline"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </Button>
          <GodModeSwitch
            enabled={state.ui.godMode}
            onToggle={(value) =>
              dispatch({ type: "TOGGLE_GODMODE", payload: { value } })
            }
          />
        </div>
      </header>

      <Tabs defaultValue="board">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
          </TabsList>
          <div className="w-full lg:max-w-2xl">
            <SearchBar value={searchValue} onChange={handleSearchChange} />
          </div>
        </div>

        <TabsContent value="board">
          <div
            className={`grid gap-6 ${
              state.ui.godMode ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            <div className="lg:col-span-3">
              <Board
                tasks={filteredTasks}
                onCreate={handleCreate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMove={handleMove}
                highlightMap={highlightMap}
              />
            </div>
            {state.ui.godMode && (
              <div className="lg:col-span-1">
                <GodModePanel tasks={state.tasks} onEvaluate={handleEdit} />
              </div>
            )}
          </div>
        </TabsContent>


        <TabsContent value="audit">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <AuditFilters
              actionFilter={actionFilter}
              taskFilter={taskFilter}
              searchFilter={searchFilter}
              onActionChange={setActionFilter}
              onTaskFilterChange={setTaskFilter}
              onSearchChange={setSearchFilter}
            />
            <CopySummaryButton events={state.audit} />
          </div>
          <AuditTable events={filteredAudit} onTimeTravel={handleTimeTravel} />
        </TabsContent>

        <TabsContent value="import">
          <ImportExportPanel
            onExport={handleExport}
            onImport={handleImport}
            importErrors={importErrors}
            exampleState={defaultState}
          />
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initial={dialogTask}
        defaultStatus={defaultStatus}
        godMode={state.ui.godMode}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
