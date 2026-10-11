import { useState } from "react";

import type { Follow } from "../../business/types/follow";
import {
  readFollows,
  sendFollowRequest,
  removeFollow,
  getFollowStatus
} from "../../data/repositories/followStore";

/*
  Todo lo de "seguir" en un solo lugar. Uso:

    const { followers, following, statusOf, follow, unfollow } = useFollows(user.id);
    statusOf(otro.id)   → "none" | "pending" | "accepted"
    follow(otro.id)     → envía la solicitud
    unfollow(otro.id)   → deja de seguir o cancela la solicitud
*/
export function useFollows(userId: string) {
  const [follows, setFollows] = useState<Follow[]>(readFollows);

  const followers = follows.filter(
    (f) => f.followingId === userId && f.status === "accepted"
  ).length;

  const following = follows.filter(
    (f) => f.followerId === userId && f.status === "accepted"
  ).length;

  return {
    followers,
    following,
    statusOf: (targetId: string) => getFollowStatus(follows, userId, targetId),
    follow: (targetId: string) => setFollows(sendFollowRequest(userId, targetId)),
    unfollow: (targetId: string) => setFollows(removeFollow(userId, targetId))
  };
}
