import { createContext, useContext } from "react";

export type ToastType = "success" | "error" | "info";

export type ToastApi = {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

export const ToastContext = createContext<ToastApi | null>(null);

/*
  Uso en cualquier componente:

    const { success, error } = useToast();
    success("Guardado correctamente");
    error("No se pudo guardar");
*/
export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }

  return ctx;
};
