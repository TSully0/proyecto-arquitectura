import type { ButtonHTMLAttributes, ReactNode } from "react";

import "../../styles/ui.css";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

/*
  Botón compartido. Ejemplos:

    <Button onClick={guardar}>Guardar</Button>
    <Button variant="secondary" onClick={cerrar}>Cancelar</Button>
    <Button variant="danger" size="sm" icon={<Trash2 size={14} />}>Eliminar</Button>
    <Button type="submit" fullWidth>Entrar</Button>
*/
export function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "ui-btn",
    `ui-btn-${variant}`,
    `ui-btn-${size}`,
    fullWidth ? "ui-btn-full" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
