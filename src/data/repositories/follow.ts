import { supabase } from "../supabase";
import type { Follow } from "../../business/types/follow";

/* =========================
   SEGUIR USUARIO (PENDING)
   ========================= */
    export async function followUser(follow: Follow): Promise<boolean> {
    try {
        const { error } = await supabase.from("follows").insert([
        {
            id: follow.id,
            follower_id: follow.followerId,
            following_id: follow.followingId,
            status: follow.status || "pending", // 👈 IMPORTANTE
            created_at: follow.createdAt || new Date().toISOString()
        }
        ]);

        if (error) {
        console.warn("Error al seguir usuario:", error);
        return false;
        }

        return true;
    } catch (err) {
        console.warn("Error en followUser:", err);
        return false;
    }
    }

    /* =========================
    CANCELAR / UNFOLLOW
    ========================= */
    export async function unfollowUser(
    followerId: string,
    followingId: string
    ): Promise<boolean> {
    try {
        const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

        if (error) {
        console.warn("Error al unfollow:", error);
        return false;
        }

        return true;
    } catch (err) {
        console.warn("Error en unfollowUser:", err);
        return false;
    }
    }

    /* =========================
    ACTUALIZAR STATUS (ACEPTAR FOLLOW)
    ========================= */
    export async function acceptFollow(followId: string): Promise<boolean> {
    try {
        const { error } = await supabase
        .from("follows")
        .update({ status: "accepted" })
        .eq("id", followId);

        if (error) {
        console.warn("Error al aceptar follow:", error);
        return false;
        }

        return true;
    } catch (err) {
        console.warn("Error en acceptFollow:", err);
        return false;
    }
    }

    /* =========================
    OBTENER SIGUIENDO
    ========================= */
    export async function getFollowing(userId: string): Promise<Follow[]> {
    const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", userId);

    if (error) {
        console.warn("Error getFollowing:", error);
        return [];
    }

    return (
        data?.map((f) => ({
        id: f.id,
        followerId: f.follower_id,
        followingId: f.following_id,
        status: f.status, // 👈 NUEVO
        createdAt: f.created_at
        })) || []
    );
    }

    /* =========================
    OBTENER SEGUIDORES
    ========================= */
    export async function getFollowers(userId: string): Promise<Follow[]> {
    const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("following_id", userId);

    if (error) {
        console.warn("Error getFollowers:", error);
        return [];
    }
    return (
        data?.map((f) => ({
        id: f.id,
        followerId: f.follower_id,
        followingId: f.following_id,
        status: f.status, // 👈 NUEVO
        createdAt: f.created_at
    })) || []
    );
}