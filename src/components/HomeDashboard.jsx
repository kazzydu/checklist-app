import { Sun, Target, Flame, TrendingUp, ChevronRight, Sparkles, Plus } from "lucide-react";
import { useMemo } from "react";
import Logo from './Logo';

const t = (key, lang) => {
  const translations = {
    en: {
      subtitle: "Turn Your Goals Into Milestones.",
      todaysFocus: "Today's Focus",
      seeAll: "See all",
      activeGoals: "Active Goals",
      streak: "Streak",
      doneToday: "Done today",
      progress: "Progress",
      goals: "Goals",
      noTasksToday: "No tasks for today. You're all caught up!",
      noGoalsTitle: "No goals yet.",
      noGoalsBody: "Start with one thing you want to accomplish.",
      createGoal: "Create Your First Goal",
      milestones: "milestones",
      milestone: "milestone",
    },
    es: {
      subtitle: "Convierte tus metas en hitos.",
      todaysFocus: "Enfoque de Hoy",
      seeAll: "Ver todo",
      activeGoals: "Metas Activas",
      streak: "Racha",
      doneToday: "Hecho hoy",
      progress: "Progreso",
      goals: "Metas",
      noTasksToday: "No hay tareas para hoy. ¡Estás al día!",
      noGoalsTitle: "Aún no hay metas.",
      noGoalsBody: "Empieza con algo que quieras lograr.",
      createGoal: "Crea Tu Primera Meta",
      milestones: "hitos",
      milestone: "hito",
    },
  };
  return translations[lang]?.[key] || translations.en[key];
};

export default function HomeDashboard({
  goals = [],
  darkMode = false,
  streak = 0,
  completionLog = [],
  currentWeek = 1,
  onNavigate = () => {},
  onRestoreGoals = () => {},
  lang = "en",
}) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const doneToday = completionLog.filter((e) => {
      if (!e.done) return false;
      const d = new Date(e.ts).toISOString().slice(0, 10);
      return d === todayStr;
    }).length;

    let totalTasks = 0;
    let totalDone = 0;
    goals.forEach((g) => {
      (g.milestones || []).forEach((m) => {
        (m.tasks || []).forEach((tk) => {
          totalTasks++;
          if (tk.done) totalDone++;
        });
      });
    });

    const progress = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

    return { doneToday, totalTasks, totalDone, progress, activeGoals: goals.length };
  }, [goals, completionLog, todayStr]);

  const todayTasks = useMemo(() => {
    const tasks = [];
    goals.forEach((g) => {
      (g.milestones || []).forEach((m) => {
        (m.tasks || []).forEach((tk) => {
          if (!tk.done && tk.week === currentWeek) {
            tasks.push({ goalIcon: g.icon, goalColor: g.color, taskText: tk.text, week: tk.week, goalId: g.id });
          }
        });
      });
    });
    return tasks.slice(0, 5);
  }, [goals, currentWeek]);

  const goalProgress = useMemo(() => {
    return goals.map((g) => {
      let total = 0;
      let done = 0;
      (g.milestones || []).forEach((m) => {
        (m.tasks || []).forEach((tk) => {
          total++;
          if (tk.done) done++;
        });
      });
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const milestonesCompleted = (g.milestones || []).filter((m) =>
        (m.tasks || []).length > 0 && (m.tasks || []).every((tk) => tk.done)
      ).length;
      return { ...g, pct, done, total, milestonesCompleted, totalMilestones: (g.milestones || []).length };
    });
  }, [goals]);

  const quote = useMemo(() => {
    const quotes = [
      { en: "A small step today is a giant leap forward.", es: "Un pequeño paso hoy es un gran salto adelante." },
      { en: "Progress, not perfection.", es: "Progreso, no perfección." },
      { en: "Your future self will thank you.", es: "Tu yo del futuro te lo agradecerá." },
      { en: "Consistency beats intensity.", es: "La constancia vence a la intensidad." },
      { en: "Every milestone is a victory.", es: "Cada hito es una victoria." },
    ];
    return quotes[new Date().getDate() % quotes.length][lang] || quotes[0][lang];
  }, [lang]);

  const statItems = [
    { icon: <Flame size={18} />, value: streak, label: t("streak", lang), color: "text-orange-500" },
    { icon: <Sun size={18} />, value: stats.doneToday, label: t("doneToday", lang), color: "text-emerald-500" },
    { icon: <TrendingUp size={18} />, value: `${stats.progress}%`, label: t("progress", lang), color: "text-blue-500" },
    { icon: <Target size={18} />, value: stats.activeGoals, label: t("goals", lang), color: "text-purple-500" },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={42} />
            <h1 className="text-xl font-extrabold tracking-tight leading-none">
              <span className="text-blue-500">Milestone</span>{' '}
              <span className="text-emerald-500">Mindset</span>
            </h1>
          </div>
          <button
            onClick={() => onNavigate("settings")}
            className={`w-11 h-11 flex items-center justify-center rounded-xl ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-200"} transition-colors`}
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          {statItems.map((s, i) => (
            <div
              key={i}
              className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm p-3 flex flex-col items-center gap-1`}
            >
              <span className={s.color}>{s.icon}</span>
              <span className="text-lg font-bold leading-none">{s.value}</span>
              <span className={`text-[10px] font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Today's Focus */}
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-amber-500" />
              <h2 className="text-sm font-bold">{t("todaysFocus", lang)}</h2>
            </div>
            <button
              onClick={() => onNavigate("today")}
              className={`text-xs font-medium flex items-center gap-0.5 min-h-[44px] min-w-[44px] justify-end ${darkMode ? "text-blue-400" : "text-blue-600"}`}
            >
              {t("seeAll", lang)} <ChevronRight size={14} />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles size={24} className="mx-auto mb-2 text-amber-400" />
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("noTasksToday", lang)}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((tk, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate("today")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left min-h-[44px] ${darkMode ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"} transition-colors`}
                >
                  <span className="text-lg shrink-0">{tk.goalIcon}</span>
                  <span className="text-sm font-medium flex-1 truncate">{tk.taskText}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${darkMode ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-600"}`}>
                    W{tk.week}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Goals */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold">
              {t("activeGoals", lang)}
              {goals.length > 0 && (
                <span className={`ml-2 text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  ({goals.length})
                </span>
              )}
            </h2>
          </div>

          {goals.length === 0 ? (
            <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm p-6 text-center`}>
              <Target size={28} className={`mx-auto mb-3 ${darkMode ? "text-gray-600" : "text-gray-300"}`} />
              <p className="text-sm font-semibold mb-1">{t("noGoalsTitle", lang)}</p>
              <p className={`text-xs mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("noGoalsBody", lang)}</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onNavigate("createGoal")}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-sm font-bold rounded-xl min-h-[44px]"
                >
                  <Plus size={16} /> {t("createGoal", lang)}
                </button>
                <button
                  onClick={onRestoreGoals}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl min-h-[44px]"
                >
                  🔄 Restore My Semester Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {goalProgress.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onNavigate("goal", { goalId: g.id })}
                  className={`w-full text-left ${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm p-4 min-h-[44px] transition-colors ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-100"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{g.icon}</span>
                    <span className="text-sm font-bold flex-1">{g.name}</span>
                    <span className={`text-xs font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{g.pct}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full mb-2 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${g.pct}%`, background: g.color || "#3b82f6" }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {g.done}/{g.total} tasks
                    </span>
                    <span className={`text-[11px] ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {g.milestonesCompleted}/{g.totalMilestones} {g.totalMilestones === 1 ? t("milestone", lang) : t("milestones", lang)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Motivational Quote */}
        <div className={`${darkMode ? "bg-gray-800/50" : "bg-white/50"} rounded-2xl p-4 text-center`}>
          <Sparkles size={14} className={`mx-auto mb-1.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
          <p className={`text-xs italic leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>"{quote}"</p>
        </div>
      </div>
    </div>
  );
}
