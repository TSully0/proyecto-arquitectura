import { useProfilePhoto } from "../../hooks/useProfilePhoto";
import { Avatar } from "./Avatar";

interface UserAvatarProps {
  userId: string;
  name: string;
  size?: number;
  shape?: "circle" | "square";
  className?: string;
}

/*
  Avatar de un usuario: busca su foto y, si no tiene, muestra su inicial.
    <UserAvatar userId={user.id} name={user.name} size={32} shape="circle" />
*/
export function UserAvatar({ userId, ...rest }: UserAvatarProps) {
  const photo = useProfilePhoto(userId);

  return <Avatar photo={photo} {...rest} />;
}
