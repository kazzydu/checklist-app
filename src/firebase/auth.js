import { supabase } from "../supabase";

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/auth/callback",
    },
  });
  return { data, error };
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export function onAuthChange(callback) {
  const { data: { subscription} } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session?.user);
    }
  );
  return subscription;
}

export function getAuthErrorMessage(error) {
  if (!error) return "An unexpected error occurred";
  const errorCode = error.status?.toString() || error.code;
  const messages = {
    "40001": "Invalid email or password",
    "23505": "User already exists",
    "23514": "Email is already registered",
    "invalid_grant": "Sign in cancelled or expired",
    "access_denied": "Permission denied",
  };
  return messages[errorCode] || error.message || "Sign in failed";
}

export async function getRedirectResult() {
  const { data, error } = await supabase.auth.getRedirectResult();
  return { data, error };
}

export async function updatePresence(userId, isOnline) {
  const { data, error } = await supabase
    .from("presence")
    .upsert(
      { user_id: userId, is_online: isOnline, last_seen: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select();
  return { data, error };
}

export async function listenPresence(userId, callback) {
  const { data, error } = await supabase
    .from("presence")
    .select("user_id, is_online, last_seen")
    .eq("user_id", userId);
  if (!callback) return;
  callback(data);
  return { data, error };
}

export async function updateStreak(userId, newStreak) {
  const { data, error } = await supabase
    .from("streak_tracking")
    .upsert(
      { user_id: userId, current_streak: newStreak, last_visited: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select();
  return { data, error };
}

export async function getStreak(userId, callback) {
  const { data, error } = await supabase
    .from("streak_tracking")
    .select("current_streak")
    .eq("user_id", userId)
    .single();
  if (callback) callback(data?.current_streak ?? 0);
  return { data, error };
}

export async function exportUserData(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId);
  return { data, error };
}

export async function importUserData(userId, importData) {
  const { error } = await supabase.from("profiles").upsert([importData.profile], { onConflict: "id" });
  return { error };
}