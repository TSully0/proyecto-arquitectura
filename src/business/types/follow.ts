export type FollowStatus = "pending" | "accepted";

export interface Follow {
  id: string;
  followerId: string;   // quien sigue
  followingId: string;  // a quien sigue
  status: FollowStatus; // estado de la solicitud
  createdAt: string;
}