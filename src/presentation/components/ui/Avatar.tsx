import "../../../styles/avatar.css";

interface AvatarProps {
  name: string;
  photo?: string | null;          // si no hay foto, se muestra la inicial
  size?: number;
  shape?: "circle" | "square";
  className?: string;
}

/*
  Avatar neutro: la inicial del nombre, o la foto si existe.
    <Avatar name="María" size={40} />
    <Avatar name="María" photo={foto} shape="circle" />
*/
export function Avatar({
  name,
  photo,
  size = 40,
  shape = "square",
  className = ""
}: AvatarProps) {
  const classes = [
    "ui-avatar",
    shape === "circle" ? "ui-avatar-circle" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${classes} ui-avatar-photo`}
        style={style}
      />
    );
  }

  return (
    <div className={classes} style={style} role="img" aria-label={name}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}
