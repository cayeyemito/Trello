import * as React from "react";
import { Button } from "@/src/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/components/ui/tooltip";

type TimeTravelButtonProps = {
  onConfirm: () => void;
};

export function TimeTravelButton({ onConfirm }: TimeTravelButtonProps) {
  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="outline">
              Revertir (Experimental)
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Volver a este punto del historial.</TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revertir a este evento</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción reconstruye el estado aplicando los eventos hasta este punto.
            Se registrará un evento de auditoría con nota de time travel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Revertir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
