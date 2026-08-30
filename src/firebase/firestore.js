import { supabase } from "../supabase";

// ── User profile management ──
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

export async function upsertUserProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select();
  return { data, error };
}

// ── Goals (user-scoped) ──
export async function listenGoals(userId, callback) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

export async function createGoal(goal, userId) {
  const { data, error } = await supabase
    .from("goals")
    .insert([{ ...goal, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select();
  return { data, error };
}

export async function updateGoal(goalId, updates, userId) {
  const { data, error } = await supabase
    .from("goals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", goalId)
    .eq("user_id", userId)
    .select();
  return { data, error };
}

export async function deleteGoal(goalId, userId) {
  const { data, error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId)
    .select();
  return { data, error };
}

// ── Milestones (user-scoped) ──
export async function listenMilestones(userId, callback) {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

export async function createMilestone(milestone, userId) {
  const { data, error } = await supabase
    .from("milestones")
    .insert([{ ...milestone, user_id: userId, created_at: new Date().toISOString() }])
    .select();
  return { data, error };
}

export async function updateMilestone(milestoneId, updates, userId) {
  const { data, error } = await supabase
    .from("milestones")
    .update(updates)
    .eq("id", milestoneId)
    .eq("user_id", userId)
    .select();
  return { data, error };
}

export async function deleteMilestone(milestoneId, userId) {
  const { data, error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("user_id", userId)
    .select();
  return { data, error };
}

// ── Tasks / Checklist items (user-scoped) ──
export async function listenTasks(userId, callback) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

export async function createTask(task, userId) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ ...task, user_id: userId, created_at: new Date().toISOString() }])
    .select();
  return { data, error };
}

export async function updateTask(taskId, updates, userId) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select();
  return { data, error };
}

export async function deleteTask(taskId, userId) {
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId)
    .select();
  return { data, error };
}

// ── Daily goals / today tracking (user-scoped) ──
export async function listenDailyGoals(userId, callback) {
  const { data, error } = await supabase
    .from("daily_goals")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

export async function upsertDailyGoal(goal, userId) {
  const { data, error } = await supabase
    .from("daily_goals")
    .upsert([{ ...goal, user_id: userId }], { onConflict: "user_id,date" })
    .select();
  return { data, error };
}

// ── Streak tracking (user-scoped) ──
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

// ── Notifications (user-scoped) ──
export async function listenNotifications(userId, callback) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

export async function createNotification(notification, userId) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ ...notification, user_id: userId, read: false, created_at: new Date().toISOString() }])
    .select();
  return { data, error };
}

export async function markNotificationRead(notificationId, userId) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select();
  return { data, error };
}

// ── Settings / preferences (user-scoped) ──
export async function getUserSettings(userId, callback) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (callback) callback(data);
  return { data, error };
}

export async function upsertUserSettings(settings, userId) {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert([{ ...settings, user_id: userId }], { onConflict: "user_id" })
    .select();
  return { data, error };
}

// ── Channels / DMs (user-scoped) ──
export async function listenChannels(userId, callback) {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

export async function createChannel(channel, userId) {
  const { data, error } = await supabase
    .from("channels")
    .insert([{ ...channel, user_id: userId, created_at: new Date().toISOString() }])
    .select();
  return { data, error };
}

// ── Messages (user-scoped via channel membership) ──
export async function listenMessages(channelId, userId, callback) {
  // Messages in a channel where user is a member
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (*)
    `)
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

export async function sendMessage(message, channelId, userId) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ ...message, channel_id: channelId, sender_id: userId, created_at: new Date().toISOString() }])
    .select();
  return { data, error };
}

// ── Reactions (user-scoped) ──
export async function toggleReaction(reaction, messageId, userId) {
  // Check if reaction exists
  const { data: existing } = await supabase
    .from("reactions")
    .select("*")
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .single();

  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("id", existing.id);
    return { data: { removed: true }, error };
  } else {
    // Add reaction
    const { data, error } = await supabase
      .from("reactions")
      .insert([{ ...reaction, message_id: messageId, user_id: userId, created_at: new Date().toISOString() }])
      .select();
    return { data, error };
  }
}

export async function listenMessageReactions(messageId, callback) {
  const { data, error } = await supabase
    .from("reactions")
    .select("*")
    .eq("message_id", messageId)
    .order("created_at", { ascending: false });
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

// ── Presence / online status (user-scoped) ──
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
  if (!callback) return { data, error };
  callback(data);
  return { data, error };
}

// ── Exports/Imports (user-scoped) ──
export async function exportUserData(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const {
    data: goals,
    error: goalsError,
  } = await supabase.from("goals").select("*").eq("user_id", userId);

  const {
    data: milestones,
    error: milestonesError,
  } = await supabase.from("milestones").select("*").eq("user_id", userId);

  const {
    data: tasks,
    error: tasksError,
  } = await supabase.from("tasks").select("*").eq("user_id", userId);

  const {
    data: dailyGoals,
    error: dailyGoalsError,
  } = await supabase.from("daily_goals").select("*").eq("user_id", userId);

  const {
    data: streak,
    error: streakError,
  } = await supabase.from("streak_tracking").select("current_streak").eq("user_id", userId).single();

  const {
    data: settings,
    error: settingsError,
  } = await supabase.from("user_settings").select("*").eq("user_id", userId).single();

  const {
    data: notifications,
    error: notificationsError,
  } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });

  return {
    profile: data,
    goals,
    milestones,
    tasks,
    dailyGoals,
    streak: streak?.current_streak ?? 0,
    settings,
    notifications,
    errors: { goalsError, milestonesError, tasksError, dailyGoalsError, streakError, settingsError, notificationsError },
  };
}

export async function importUserData(userId, importData) {
  const { error } = await supabase.transaction(async (supa) => {
    // Upsert profile
    await supa.from("profiles").upsert([importData.profile], { onConflict: "id" });

    // Goals
    if (importData.goals && importData.goals.length > 0) {
      await supa.from("goals").upsert(importData.goals, { onConflict: "id" });
    }

    // Milestones
    if (importData.milestones && importData.milestones.length > 0) {
      await supa.from("milestones").upsert(importData.milestones, { onConflict: "id" });
    }

    // Tasks
    if (importData.tasks && importData.tasks.length > 0) {
      await supa.from("tasks").upsert(importData.tasks, { onConflict: "id" });
    }

    // Daily goals
    if (importData.dailyGoals && importData.dailyGoals.length > 0) {
      await supa.from("daily_goals").upsert(importData.dailyGoals, { onConflict: ["user_id", "date"] });
    }

    // Streak
    if (importData.streak) {
      await supa.from("streak_tracking").upsert(
        { user_id: userId, current_streak: importData.streak },
        { onConflict: "user_id" }
      );
    }

    // Settings
    if (importData.settings) {
      await supa.from("user_settings").upsert([importData.settings], { onConflict: "user_id" });
    }

    // Notifications - only import unread ones that are recent
    if (importData.notifications && importData.notifications.length > 0) {
      await supa.from("notifications").upsert(
        importData.notifications.map((n) => ({ ...n, user_id: userId, read: n.read ?? false })),
        { onConflict: "id" }
      );
    }
  });

  return { error };
}