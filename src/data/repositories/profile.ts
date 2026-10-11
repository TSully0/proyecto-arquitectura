import type { CommunityUser, ProfilePost } from "../../business/types/profile";

// DATOS DE EJEMPLO.
// Cuando exista la base de datos, solo se cambia el interior de estas funciones
// y las pantallas siguen igual.

const SAMPLE_PEOPLE: CommunityUser[] = [
  { id: "10", name: "Luis Mendoza", role: "user" },
  { id: "11", name: "Andrea Pico", role: "user" },
  { id: "12", name: "Carlos Tech", role: "moderator" }
];

export const getCommunityPeople = (): CommunityUser[] => SAMPLE_PEOPLE;

export const getPostsByUser = (userId: string): ProfilePost[] => [
  {
    id: "p1",
    userId,
    title: "Cineplex Manta",
    description: "Excelente lugar después de clases",
    location: "Manta",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
    likes: 54,
    comments: 8
  },
  {
    id: "p2",
    userId,
    title: "Playa Murciélago",
    description: "Atardecer increíble",
    location: "Manta",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    likes: 87,
    comments: 14
  }
];
