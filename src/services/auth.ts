import { supabase } from "../lib/supabase";

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  telegram?: string;
  className?: string;
}

export async function signUp(data: RegisterData) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
      },
    },
  });

  if (error) throw error;

  if (!authData.user) {
    throw new Error("Користувача не створено");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      phone: data.phone ?? "",
      telegram: data.telegram ?? "",
      class_name: data.className ?? "",
      structure: "Уряд ліцею",
    })
    .eq("id", authData.user.id);

  if (profileError) throw profileError;

  return authData.user;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();

  return data.user;
}

export function onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
  return supabase.auth.onAuthStateChange(callback);
}