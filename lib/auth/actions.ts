// lib/auth/actions.ts
import bcrypt from "bcryptjs";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function createUserProfile(
  userId: string,
  username: string,
  password: string,
  pin?: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "No supabase client" };

  const password_hash = await hashPassword(password);
  const pin_hash = pin ? await hashPin(pin) : null;

  const { error } = await supabase.from("users").insert({
    id: userId,
    username,
    password_hash,
    pin_hash,
  });

  return { error };
}

export async function isUsernameTaken(username: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data } = await supabase
    .from("users")
    .select("username")
    .eq("username", username)
    .single();

  return !!data;
}