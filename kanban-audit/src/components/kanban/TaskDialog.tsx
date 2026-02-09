import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { type Task, type TaskPriority, type TaskStatus } from "@/src/types";

const schema = z
  .object({
    titulo: z.string().min(3, "Mínimo 3 caracteres"),
    descripcion: z.string().optional(),
    prioridad: z.enum(["low", "medium", "high"]),
    tags: z.string().optional(),
    estimacionMin: z.coerce.number().min(0, "Debe ser >= 0"),
    fechaLimite: z.string().optional(),
    estado: z.enum(["todo", "doing", "done"]),
    observacionesJavi: z.string().optional(),
    rubricaScore: z
      .preprocess((value) => (value === "" ? undefined : value), z.coerce.number().min(0).max(10))
      .optional(),
    rubricaComentario: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.fechaLimite) return true;
      const due = new Date(data.fechaLimite);
      return !Number.isNaN(due.getTime());
    },
    {
      message: "Fecha límite inválida",
      path: ["fechaLimite"],
    }
  );

type FormValues = z.infer<typeof schema>;

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Task | null;
  defaultStatus: TaskStatus;
  godMode: boolean;
  onSubmit: (values: {
    task: Task;
    isNew: boolean;
  }) => void;
};

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

export function TaskDialog({
  open,
  onOpenChange,
  mode,
  initial,
  defaultStatus,
  godMode,
  onSubmit,
}: TaskDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: initial?.titulo ?? "",
      descripcion: initial?.descripcion ?? "",
      prioridad: initial?.prioridad ?? "medium",
      tags: initial?.tags.join(", ") ?? "",
      estimacionMin: initial?.estimacionMin ?? 30,
      fechaLimite: initial?.fechaLimite?.slice(0, 10) ?? "",
      estado: initial?.estado ?? defaultStatus,
      observacionesJavi: initial?.observacionesJavi ?? "",
      rubricaScore: initial?.rubrica?.score ?? undefined,
      rubricaComentario: initial?.rubrica?.comentario ?? "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      titulo: initial?.titulo ?? "",
      descripcion: initial?.descripcion ?? "",
      prioridad: initial?.prioridad ?? "medium",
      tags: initial?.tags.join(", ") ?? "",
      estimacionMin: initial?.estimacionMin ?? 30,
      fechaLimite: initial?.fechaLimite?.slice(0, 10) ?? "",
      estado: initial?.estado ?? defaultStatus,
      observacionesJavi: initial?.observacionesJavi ?? "",
      rubricaScore: initial?.rubrica?.score ?? undefined,
      rubricaComentario: initial?.rubrica?.comentario ?? "",
    });
  }, [open, initial, defaultStatus, form]);

  const handleSubmit = (values: FormValues) => {
    const nowIso = new Date().toISOString();
    const fechaCreacion = initial?.fechaCreacion ?? nowIso;
    if (values.fechaLimite) {
      const dueDate = new Date(values.fechaLimite);
      if (dueDate.getTime() < new Date(fechaCreacion).getTime()) {
        form.setError("fechaLimite", {
          type: "validate",
          message: "Debe ser posterior a la fecha de creación",
        });
        return;
      }
    }
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

    const task: Task = {
      id: initial?.id ?? uuidv4(),
      titulo: values.titulo,
      descripcion: values.descripcion?.trim() || undefined,
      prioridad: values.prioridad,
      tags,
      estimacionMin: values.estimacionMin,
      fechaCreacion,
      fechaLimite: values.fechaLimite ? new Date(values.fechaLimite).toISOString() : undefined,
      estado: values.estado,
      observacionesJavi: godMode ? values.observacionesJavi?.trim() || undefined : undefined,
      rubrica: godMode && values.rubricaScore !== undefined
        ? {
            score: values.rubricaScore,
            comentario: values.rubricaComentario?.trim() || undefined,
          }
        : undefined,
    };

    onSubmit({ task, isNew: mode === "create" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva tarea" : "Editar tarea"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Registra una operación del equipo."
              : "Actualiza los detalles y la auditoría registrará el cambio."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder="Título de la tarea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contexto de la operación" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prioridad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimacionMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimación (min)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (coma)</FormLabel>
                  <FormControl>
                    <Input placeholder="fx, riesgo, bonos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaLimite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha límite</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="doing">Doing</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {godMode && (
              <>
                <FormField
                  control={form.control}
                  name="observacionesJavi"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observaciones de Javi</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notas de revisión" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rubricaScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rúbrica (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rubricaComentario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentario rúbrica</FormLabel>
                      <FormControl>
                        <Input placeholder="Opcional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="md:col-span-2">
              <Button type="submit">
                {mode === "create" ? "Crear tarea" : "Guardar cambios"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
