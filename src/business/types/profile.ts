export type CommunityUser = {
  id: string;
  name: string;
  role: "admin" | "moderator" | "user";
};

export type ProfilePost = {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: string;
  image: string;
  likes: number;
  comments: number;
};

// relación de "yo" con otra persona
export type FollowStatus = "none" | "pending" | "accepted";
