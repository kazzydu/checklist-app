import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { translations } from './i18n';
import { signInWithGoogle, logOut, onAuthChange } from './firebase/auth';
import { subscribeToUserData, saveUserData } from './firebase/firestore';
import { requestNotificationPermission, onForegroundMessage, registerServiceWorker, showLocalNotification } from './firebase/messaging';
import { migrateIfNeeded, migrateCheckedItems, saveStoredGoals } from './data/migration';
import { DEFAULT_CHECKLIST_DATA, BUILTIN_TEMPLATES, playCompleteSound } from './data/constants';
import { migrateOldChecklistToGoals } from './data/migration';
import { SubscriptionProvider, useSubscription } from './paywall/RevenueCatProvider';
import { FREE_LIMITS } from './paywall/config';
import { Crown } from 'lucide-react';
import PaywallModal from './paywall/PaywallModal';
import HomeDashboard from './components/HomeDashboard';
import TodayScreen from './components/TodayScreen';
import GoalsList from './components/GoalsList';
import GoalDetail from './components/GoalDetail';
import CreateGoal from './components/CreateGoal';
import AnalyticsView from './components/AnalyticsView';
import BottomNav from './components/BottomNav';
import Logo from './components/Logo';

const getStoredDuration = () => parseInt(localStorage.getItem('msm_duration') || '3', 10);
const START_DATE = new Date();
const getEndDate = (months) => { const d = new Date(START_DATE); d.setMonth(d.getMonth() + months); return d; };

const calcGpa = (grades) => {
  if (!grades?.length) return '0.00';
  return (
    grades.reduce((s, g) => s + g.grade * g.credits, 0) /
    grades.reduce((s, g) => s + g.credits, 0)
  ).toFixed(2);
};

export default function App() {
  return (
    <SubscriptionProvider>
      <AppInner />
    </SubscriptionProvider>
  );
}

function AppInner() {
  const { isPro } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  const [goals, setGoals] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [completionLog, setCompletionLog] = useState([]);
  const [streak, setStreak] = useState(0);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState('en');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [planTitle, setPlanTitle] = useState(() => localStorage.getItem('msm_planTitle') || '');
  const [durationMonths, setDurationMonths] = useState(() => parseInt(localStorage.getItem('msm_duration') || '3', 10));

  const [user, setUser] = useState(null);
  const [cloudSynced, setCloudSynced] = useState(false);

  const [now, setNow] = useState(new Date());

  const [gpaCurrent, setGpaCurrent] = useState('');
  const [gpaTarget, setGpaTarget] = useState('');
  const [gpaHistory, setGpaHistory] = useState([]);
  const [showGpaInput, setShowGpaInput] = useState(false);
  const [newGrade, setNewGrade] = useState('');
  const [newCredits, setNewCredits] = useState('');

  const [dailyGoals, setDailyGoals] = useState([]);
  const [dailyGoalInput, setDailyGoalInput] = useState('');
  const [dailyGoalHistory, setDailyGoalHistory] = useState({});
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  const migratedRef = useRef(false);

  const t = translations[lang];
  const todayStr = now.toISOString().split('T')[0];

  const endDate = useMemo(() => getEndDate(durationMonths), [durationMonths]);
  const totalDays = useMemo(() => Math.ceil((endDate - START_DATE) / (1000 * 60 * 60 * 24)), [endDate]);
  const totalWeeks = useMemo(() => Math.ceil(totalDays / 7), [totalDays]);
  const currentWeek = useMemo(() => {
    const diff = Math.ceil((now - START_DATE) / (1000 * 60 * 60 * 24 * 7));
    return Math.max(1, Math.min(diff + 1, totalWeeks));
  }, [now, totalWeeks]);
  const currentMonth = durationMonths <= 1 ? 1 : durationMonths <= 3 ? (currentWeek <= 4 ? 1 : currentWeek <= 8 ? 2 : 3) : Math.ceil(currentWeek / (totalWeeks / durationMonths));

  const computedGpa = useMemo(() => calcGpa(gpaHistory), [gpaHistory]);
  const gpaDiff = useMemo(
    () => (parseFloat(gpaTarget || 0) - parseFloat(computedGpa)).toFixed(2),
    [computedGpa, gpaTarget]
  );
  const gpaProgress = useMemo(
    () =>
      Math.min(
        100,
        Math.round(
          (parseFloat(computedGpa) / (parseFloat(gpaTarget) || 4)) * 100
        )
      ),
    [computedGpa, gpaTarget]
  );

  // ── Clock ──
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Dark mode class ──
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // ── Mount: load persisted settings ──
  useEffect(() => {
    try {
      setDarkMode(localStorage.getItem('allOnDeckDarkMode') === 'true');
      setLang(localStorage.getItem('allOnDeckLang') || 'en');
      setSoundEnabled(localStorage.getItem('allOnDeckSound') !== 'false');
      setGpaCurrent(localStorage.getItem('allOnDeckGpaCurrent') || '');
      setGpaTarget(localStorage.getItem('allOnDeckGpaTarget') || '');
      setGpaHistory(JSON.parse(localStorage.getItem('allOnDeckGpaHistory') || '[]'));
      setDailyGoals(JSON.parse(localStorage.getItem('allOnDeckDailyGoals') || '[]'));
      setDailyGoalHistory(JSON.parse(localStorage.getItem('allOnDeckDailyGoalHistory') || '{}'));
      setCompletionLog(JSON.parse(localStorage.getItem('allOnDeckCompletionLog') || '[]'));
      setStreak(parseInt(localStorage.getItem('allOnDeckStreak')) || 0);
    } catch {}
  }, []);

  // ── Data migration on mount ──
  useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;

    const migrated = migrateIfNeeded();
    if (migrated.length > 0) {
      setGoals(migrated);
    } else {
      const stored = JSON.parse(localStorage.getItem('msm_goals') || '[]');
      setGoals(Array.isArray(stored) ? stored : []);
    }
  }, []);

  const pushLocalToCloudRef = useRef(false);

  // ── Firebase auth listener ──
  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      if (u) {
        const unsubFirestore = subscribeToUserData(u.uid, (data) => {
          if (data) {
            setCloudSynced(true);
            if (data.goals && data.goals.length > 0) {
              setGoals(data.goals);
              saveStoredGoals(data.goals);
            } else if (data.goals && data.goals.length === 0 && !pushLocalToCloudRef.current) {
              // Cloud is empty — push local goals UP to cloud (once)
              const local = JSON.parse(localStorage.getItem('msm_goals') || '[]');
              if (local.length > 0) {
                setGoals(local);
                pushLocalToCloudRef.current = true;
                saveUserData(u.uid, { goals: local });
              }
            }
            if (data.completionLog) setCompletionLog(data.completionLog);
            if (data.gpaCurrent) setGpaCurrent(data.gpaCurrent);
            if (data.gpaTarget) setGpaTarget(data.gpaTarget);
            if (data.gpaHistory) setGpaHistory(data.gpaHistory);
            if (data.streak) setStreak(data.streak);
            if (data.dailyGoals) setDailyGoals(data.dailyGoals);
            if (data.dailyGoalHistory) setDailyGoalHistory(data.dailyGoalHistory);
            if (data.checkedItems) setCheckedItems(data.checkedItems);
          }
        });
        return () => unsubFirestore();
      } else {
        setCloudSynced(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Cloud sync: debounced save ──
  useEffect(() => {
    if (!user) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      saveUserData(user.uid, {
        goals,
        checkedItems,
        completionLog,
        gpaCurrent,
        gpaTarget,
        gpaHistory,
        streak,
        dailyGoals,
        dailyGoalHistory,
      }).catch(console.error);
    }, 1000);
  }, [
    user, goals, checkedItems, completionLog,
    gpaCurrent, gpaTarget, gpaHistory,
    streak, dailyGoals, dailyGoalHistory,
  ]);

  // ── Foreground notifications ──
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onForegroundMessage((payload) => {
      if (payload.notification) {
        showLocalNotification(
          payload.notification.title || 'Milestone Mindset',
          payload.notification.body
        );
      }
    });
    return () => unsubscribe();
  }, [user]);

  // ── Register service worker on mount ──
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // ── Local reminders: check every 60s for due tasks & incomplete daily goals ──
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      const hour = now.getHours();

      // Only remind between 9am and 9pm
      if (hour < 9 || hour > 21) return;

      // Check for incomplete daily goals
      const todayGoals = dailyGoals.filter((g) => !g.done);
      if (todayGoals.length > 0 && hour === 12) {
        showLocalNotification(
          'Daily Goals Reminder',
          `You have ${todayGoals.length} incomplete goal${todayGoals.length > 1 ? 's' : ''} for today.`
        );
      }

      // Check for tasks due this week
      goals.forEach((goal) => {
        goal.milestones?.forEach((m) => {
          m.tasks?.forEach((task) => {
            if (!task.done && task.dueDate) {
              const due = new Date(task.dueDate);
              const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
              if (daysLeft === 0) {
                showLocalNotification(
                  'Task Due Today',
                  `"${task.text}" in ${goal.name} is due today!`
                );
              } else if (daysLeft === 1) {
                showLocalNotification(
                  'Task Due Tomorrow',
                  `"${task.text}" in ${goal.name} is due tomorrow.`
                );
              }
            }
          });
        });
      });
    };

    // Check every 60 seconds
    const interval = setInterval(checkReminders, 60000);
    checkReminders(); // Run immediately
    return () => clearInterval(interval);
  }, [notificationsEnabled, dailyGoals, goals]);

  // ── Persist goals to localStorage ──
  useEffect(() => {
    if (goals.length === 0 && !migratedRef.current) return;
    saveStoredGoals(goals);
  }, [goals]);

  // ── Keep checkedItems synced from goals (legacy compat) ──
  useEffect(() => {
    if (goals.length > 0) {
      setCheckedItems(migrateCheckedItems(goals));
    }
  }, [goals]);

  // ── Persist misc state ──
  useEffect(() => {
    localStorage.setItem('allOnDeckCompletionLog', JSON.stringify(completionLog));
  }, [completionLog]);

  useEffect(() => {
    localStorage.setItem('allOnDeckGpaCurrent', gpaCurrent);
    localStorage.setItem('allOnDeckGpaTarget', gpaTarget);
    localStorage.setItem('allOnDeckGpaHistory', JSON.stringify(gpaHistory));
  }, [gpaCurrent, gpaTarget, gpaHistory]);

  // ── Daily goals persistence + auto-reset on new day ──
  useEffect(() => {
    const savedDate = localStorage.getItem('allOnDeckDailyDate');
    if (savedDate && savedDate !== todayStr && dailyGoals.length > 0) {
      const completedCount = dailyGoals.filter((g) => g.done).length;
      setDailyGoalHistory((prev) => {
        const next = {
          ...prev,
          [savedDate]: {
            goals: dailyGoals,
            completed: completedCount,
            total: dailyGoals.length,
          },
        };
        localStorage.setItem('allOnDeckDailyGoalHistory', JSON.stringify(next));
        return next;
      });
      setDailyGoals([]);
    }
    localStorage.setItem('allOnDeckDailyGoals', JSON.stringify(dailyGoals));
    localStorage.setItem('allOnDeckDailyDate', todayStr);
  }, [dailyGoals, todayStr]);

  // ── Streak tracking ──
  useEffect(() => {
    const today = new Date().toDateString();
    const lv = localStorage.getItem('allOnDeckLastVisit');
    if (lv && lv !== today) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      if (lv === y.toDateString()) {
        const ns = (parseInt(localStorage.getItem('allOnDeckStreak')) || 0) + 1;
        setStreak(ns);
        localStorage.setItem('allOnDeckStreak', ns.toString());
      } else {
        setStreak(1);
        localStorage.setItem('allOnDeckStreak', '1');
      }
    } else if (!lv) {
      setStreak(1);
      localStorage.setItem('allOnDeckStreak', '1');
    }
    localStorage.setItem('allOnDeckLastVisit', today);

    return () => {
      localStorage.setItem('allOnDeckStreak', streak.toString());
    };
  }, [goals, streak]);

  // ── Goal CRUD ──
  const restoreGoals = useCallback(() => {
    const restored = migrateOldChecklistToGoals(DEFAULT_CHECKLIST_DATA);
    if (restored.length > 0) {
      setGoals(restored);
      saveStoredGoals(restored);
      if (user) saveUserData(user.uid, { goals: restored });
    }
  }, [user]);

  const createGoal = useCallback((goalData) => {
    if (!isPro && goals.length >= FREE_LIMITS.maxGoals) {
      setShowPaywall(true);
      return;
    }
    setGoals((prev) => {
      const next = [...prev, goalData];
      saveStoredGoals(next);
      return next;
    });
    setShowCreateGoal(false);
  }, [isPro, goals.length]);

  const updateGoal = useCallback((updatedGoal) => {
    setGoals((prev) => {
      const next = prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
      saveStoredGoals(next);
      return next;
    });
  }, []);

  const deleteGoal = useCallback((goalId) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== goalId);
      saveStoredGoals(next);
      return next;
    });
    setSelectedGoalId(null);
  }, []);

  // ── Task toggle ──
  const toggleTask = useCallback(
    (goalId, milestoneId, taskId) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;
          return {
            ...goal,
            updatedAt: Date.now(),
            milestones: goal.milestones.map((ms) => {
              if (ms.id !== milestoneId) return ms;
              return {
                ...ms,
                tasks: ms.tasks.map((tk) => {
                  if (tk.id !== taskId) return tk;
                  const newDone = !tk.done;
                  if (newDone && soundEnabled) playCompleteSound();
                  setCompletionLog((prevLog) => [
                    ...prevLog,
                    {
                      cat: goalId,
                      text: tk.text,
                      ts: Date.now(),
                      done: newDone,
                    },
                  ]);
                  return { ...tk, done: newDone };
                }),
              };
            }),
          };
        })
      );
    },
    [soundEnabled]
  );

  // ── Navigation ──
  const handleNavigate = useCallback((tab, params) => {
    if (tab === 'settings') {
      setShowSettings((v) => !v);
      return;
    }
    setActiveTab(tab);
    if (params?.goalId) {
      setSelectedGoalId(params.goalId);
    } else {
      setSelectedGoalId(null);
    }
    setShowCreateGoal(false);
  }, []);

  const handleViewGoal = useCallback((goalId) => {
    setSelectedGoalId(goalId);
    setActiveTab('goals');
    setShowCreateGoal(false);
  }, []);

  // ── Daily goals ──
  const addDailyGoal = useCallback(() => {
    const text = dailyGoalInput.trim();
    if (!text) return;
    setDailyGoals((prev) => [...prev, { text, done: false, id: Date.now() }]);
    setDailyGoalInput('');
    if (soundEnabled) playCompleteSound();
  }, [dailyGoalInput, soundEnabled]);

  const toggleDailyGoal = useCallback((id) => {
    setDailyGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  }, []);

  const removeDailyGoal = useCallback((id) => {
    setDailyGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // ── GPA ──
  const addGrade = useCallback(() => {
    const g = parseFloat(newGrade);
    const c = parseInt(newCredits);
    if (!isNaN(g) && g >= 0 && g <= 4 && !isNaN(c) && c > 0) {
      setGpaHistory((p) => [
        ...p,
        { grade: g, credits: c, date: new Date().toLocaleDateString() },
      ]);
      setNewGrade('');
      setNewCredits('');
      setShowGpaInput(false);
    }
  }, [newGrade, newCredits]);

  // ── Settings actions ──
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error('Sign-in failed:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (e) {
      console.error('Sign-out failed:', e);
    }
  };

  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      if (user) saveUserData(user.uid, { fcmToken: token }).catch(console.error);
    }
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('allOnDeckDarkMode', next.toString());
  };

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('allOnDeckLang', l);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('allOnDeckSound', next.toString());
  };

  // ── Export / Import ──
  const exportData = () => {
    const data = {
      goals,
      checkedItems,
      gpaCurrent,
      gpaTarget,
      gpaHistory,
      streak,
      completionLog,
      dailyGoals,
      dailyGoalHistory,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `milestonemindset-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.goals) {
          setGoals(data.goals);
          saveStoredGoals(data.goals);
        }
        if (data.checkedItems) setCheckedItems(data.checkedItems);
        if (data.completionLog) {
          setCompletionLog(data.completionLog);
          localStorage.setItem('allOnDeckCompletionLog', JSON.stringify(data.completionLog));
        }
        if (data.gpaCurrent) setGpaCurrent(data.gpaCurrent);
        if (data.gpaTarget) setGpaTarget(data.gpaTarget);
        if (data.gpaHistory) setGpaHistory(data.gpaHistory);
        if (data.streak) setStreak(data.streak);
        if (data.dailyGoals) setDailyGoals(data.dailyGoals);
        if (data.dailyGoalHistory) setDailyGoalHistory(data.dailyGoalHistory);
      } catch {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetAll = () => {
    if (window.confirm(t.resetConfirm)) {
      setGoals([]);
      setCheckedItems({});
      setStreak(0);
      setGpaCurrent('');
      setGpaTarget('');
      setGpaHistory([]);
      setDailyGoals([]);
      setDailyGoalHistory({});
      setCompletionLog([]);
      saveStoredGoals([]);
      [
        'allOnDeckProgress',
        'allOnDeckStreak',
        'allOnDeckLastMilestone',
        'allOnDeckLastVisit',
        'allOnDeckGpaCurrent',
        'allOnDeckGpaTarget',
        'allOnDeckGpaHistory',
        'allOnDeckDailyGoals',
        'allOnDeckDailyGoalHistory',
        'allOnDeckDailyDate',
        'allOnDeckCompletionLog',
        'msm_goals',
      ].forEach((k) => localStorage.removeItem(k));
      if (user) {
        saveUserData(user.uid, {
          goals: [],
          checkedItems: {},
          gpaCurrent: '',
          gpaTarget: '',
          gpaHistory: [],
          streak: 0,
          dailyGoals: [],
          dailyGoalHistory: {},
          completionLog: [],
        }).catch(console.error);
      }
    }
  };

  // ── Derived stats ──
  const allTasks = useMemo(
    () =>
      goals.flatMap((g) =>
        (g.milestones || []).flatMap((m) =>
          (m.tasks || []).map((tk) => ({ ...tk, goalId: g.id }))
        )
      ),
    [goals]
  );

  const completedCount = useMemo(
    () => allTasks.filter((t) => t.done).length,
    [allTasks]
  );
  const totalCount = allTasks.length;
  const progress = useMemo(
    () => (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0),
    [completedCount, totalCount]
  );

  const overdueCount = useMemo(() => {
    return allTasks.filter(
      (tk) =>
        !tk.done &&
        tk.week < currentWeek
    ).length;
  }, [allTasks, currentWeek]);

  const selectedGoal = useMemo(
    () => goals.find((g) => g.id === selectedGoalId) || null,
    [goals, selectedGoalId]
  );

  const quote = useMemo(() => {
    const quotes = [
      { en: 'A small step today is a giant leap forward.', es: 'Un pequeño paso hoy es un gran salto adelante.' },
      { en: 'Progress, not perfection.', es: 'Progreso, no perfección.' },
      { en: 'Your future self will thank you.', es: 'Tu yo del futuro te lo agradecerá.' },
      { en: 'Consistency beats intensity.', es: 'La constancia vence a la intensidad.' },
      { en: 'Every milestone is a victory.', es: 'Cada hito es una victoria.' },
    ];
    return quotes[new Date().getDate() % quotes.length][lang] || quotes[0][lang];
  }, [lang]);

  // ── Render ──
  return (
    <div
      className={`min-h-screen font-sans ${
        darkMode
          ? 'dark bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
        @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page-break { page-break-inside: avoid; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes confetti-fall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes bounce-check { 0% { transform: scale(1); } 30% { transform: scale(1.3); } 60% { transform: scale(0.9); } 100% { transform: scale(1); } }
        @keyframes pulse-urgent { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-bounce-check { animation: bounce-check 0.4s ease-out; }
        .shimmer-bg { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
        .confetti-piece { position: fixed; width: 10px; height: 10px; top: -10px; animation: confetti-fall 3s ease-in forwards; pointer-events: none; z-index: 100; }
        .glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .dark .glass { background: rgba(15,23,42,0.7); }
        .pulse-urgent { animation: pulse-urgent 2s infinite; }
        input[type="checkbox"] { display: none; }
        .dark input, .dark select { background: #1e293b; color: #e2e8f0; border-color: #334155; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Sign-in Banner (if not signed in) ── */}
      {!user && !selectedGoalId && !showCreateGoal && (
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span className="text-sm font-bold truncate">Sign in to save your progress</span>
          </div>
          <button onClick={handleSignIn} className="shrink-0 px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors">
            Sign In
          </button>
        </div>
      )}

      {/* ── Header ── */}
      {!selectedGoalId && !showCreateGoal && (
        <header className="no-print sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Logo size={40} />
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight">{t.title}</h1>
                  <input
                    type="text"
                    value={planTitle}
                    onChange={(e) => {
                      setPlanTitle(e.target.value);
                      localStorage.setItem('msm_planTitle', e.target.value);
                    }}
                    placeholder={t.subtitle}
                    className={`text-xs font-medium bg-transparent border-none outline-none p-0 w-full max-w-[180px] ${darkMode ? 'text-slate-400 placeholder:text-slate-600' : 'text-slate-500 placeholder:text-slate-400'}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title={darkMode ? t.lightMode : t.darkMode} aria-label={darkMode ? t.lightMode : t.darkMode}>
                  {darkMode ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  )}
                </button>
                <button onClick={toggleSound} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" aria-label={soundEnabled ? 'Mute' : 'Unmute'}>
                  {soundEnabled ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  )}
                </button>
                <button onClick={handleEnableNotifications} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" title={notificationsEnabled ? t.notificationsEnabled : t.enableNotifications} aria-label={notificationsEnabled ? t.notificationsEnabled : t.enableNotifications}>
                  {notificationsEnabled ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  )}
                </button>
                <button onClick={() => setShowSettings((p) => !p)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors" aria-label="Settings">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
              </div>
            </div>

            {/* ── Settings Panel ── */}
            {showSettings && (
              <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{t.language}</span>
                  <select
                    value={lang}
                    onChange={(e) => changeLang(e.target.value)}
                    className="text-xs rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-600"
                    aria-label={t.language}
                  >
                    <option value="en">English</option>
                    <option value="es">Espanol</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Plan Duration</span>
                  <select
                    value={durationMonths}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setDurationMonths(v);
                      localStorage.setItem('msm_duration', String(v));
                      window.location.reload();
                    }}
                    className="text-xs rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-600"
                    aria-label="Plan Duration"
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>1 Year</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportData}
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {t.exportData}
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    {t.importData}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".json" onChange={importData} className="hidden" />
                </div>
                <button
                  onClick={resetAll}
                  className="w-full py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                >
                  Reset All
                </button>

                {/* Upgrade to Pro */}
                {!isPro && (
                  <button
                    onClick={() => { setShowSettings(false); setShowPaywall(true); }}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <Crown size={14} /> Upgrade to Pro — $4.99/mo
                  </button>
                )}
                {isPro && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Crown size={14} /> Pro Plan Active
                  </div>
                )}

                {/* Cloud Sync Status */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  {user ? (
                    <div className="flex items-center gap-2 flex-1">
                      {user.photoURL && (
                        <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{user.displayName || user.email}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          {cloudSynced ? (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                              Synced
                            </>
                          ) : (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                              Syncing...
                            </>
                          )}
                        </div>
                      </div>
                      <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400" aria-label="Sign out">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleSignIn} className="w-full py-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Sign in with Google
                    </button>
                  )}
                </div>

                {/* GPA Tracker (collapsible in settings) */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 12 3 12 0v-5"/></svg>
                      {t.gpaTracker}
                    </span>
                    {gpaHistory.length > 0 && (
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{computedGpa}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">{t.targetGpa}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={gpaTarget}
                        onChange={(e) => setGpaTarget(e.target.value)}
                        placeholder="e.g. 3.0"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mb-1">{t.startingGpa}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={gpaCurrent}
                        onChange={(e) => setGpaCurrent(e.target.value)}
                        placeholder="e.g. 1.7"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                  {gpaTarget && (
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                        <span>{t.gpaProgress}</span>
                        <span>{gpaProgress}% {t.toTarget}</span>
                      </div>
                      <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" style={{ width: `${gpaProgress}%` }} />
                      </div>
                      {parseFloat(gpaDiff) > 0 && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 text-center">{t.needMore.replace('{diff}', gpaDiff)}</div>
                      )}
                      {parseFloat(computedGpa) >= parseFloat(gpaTarget) && gpaHistory.length > 0 && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 text-center">{t.targetReached}</div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => setShowGpaInput(!showGpaInput)}
                    className="w-full py-1.5 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-[11px] font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors mb-2"
                  >
                    {showGpaInput ? t.cancel : t.addCourseGrade}
                  </button>
                  {showGpaInput && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-2 space-y-2 animate-fade-in-up mb-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" step="0.01" min="0" max="4" value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="3.5" className="w-full px-2 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                        <input type="number" min="1" max="6" value={newCredits} onChange={(e) => setNewCredits(e.target.value)} placeholder="3" className="w-full px-2 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800" />
                      </div>
                      <button onClick={addGrade} disabled={!newGrade || !newCredits} className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">{t.addGrade}</button>
                    </div>
                  )}
                  {gpaHistory.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {gpaHistory.map((e, i) => (
                        <div key={i} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{e.grade.toFixed(2)}</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">{e.credits} cr</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400">{e.date}</span>
                            <button onClick={() => setGpaHistory((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xs font-bold" aria-label="Remove grade">×</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Countdown ── */}
            <div className="mt-3 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-amber-500/10 dark:from-blue-500/20 dark:via-emerald-500/20 dark:to-amber-500/20 rounded-xl p-3 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span className="text-xs font-bold uppercase tracking-wider">{t.timeRemaining}</span>
                </div>
                {overdueCount > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 pulse-urgent">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    {overdueCount} {t.overdue}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-extrabold">{Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t.days}</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{Math.max(0, Math.floor(Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) / 7))}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t.weeks}</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{currentMonth}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t.monthsLeft}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, Math.round(((totalDays - Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)))) / totalDays) * 100)))}%` }} />
                </div>
              </div>
            </div>

            {/* ── Progress Bar ── */}
            <div className="mt-3 relative">
              <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <span>{progress === 100 ? 'Champion mode activated!' : progress > 0 ? 'Keep going!' : 'Ready to start?'}</span>
                <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-400 relative" style={{ width: `${Math.max(progress, 2)}%` }}>
                  <div className="absolute inset-0 shimmer-bg rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>{completedCount} of {totalCount} completed</span>
                <span>Week {currentWeek} of {totalWeeks}</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* ── Main Content Area ── */}
      <main className="pb-20">
        {activeTab === 'home' && !selectedGoalId && !showCreateGoal && (
          <HomeDashboard
            goals={goals}
            darkMode={darkMode}
            streak={streak}
            completionLog={completionLog}
            currentWeek={currentWeek}
            onNavigate={handleNavigate}
            onRestoreGoals={restoreGoals}
            lang={lang}
          />
        )}

        {activeTab === 'today' && !selectedGoalId && !showCreateGoal && (
          <TodayScreen
            goals={goals}
            currentWeek={currentWeek}
            onToggleTask={toggleTask}
            darkMode={darkMode}
            streak={streak}
            completionLog={completionLog}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'goals' && !selectedGoalId && !showCreateGoal && (
          <GoalsList
            goals={goals}
            darkMode={darkMode}
            onViewGoal={handleViewGoal}
            onCreateGoal={() => setShowCreateGoal(true)}
            onDeleteGoal={deleteGoal}
            lang={lang}
            isPro={isPro}
          />
        )}

        {activeTab === 'goals' && selectedGoalId && selectedGoal && (
          <GoalDetail
            goal={selectedGoal}
            darkMode={darkMode}
            onBack={() => {
              setSelectedGoalId(null);
            }}
            onUpdateGoal={updateGoal}
            currentWeek={currentWeek}
            lang={lang}
          />
        )}

        {showCreateGoal && (
          <CreateGoal
            darkMode={darkMode}
            onSave={createGoal}
            onCancel={() => setShowCreateGoal(false)}
            lang={lang}
            builtinTemplates={BUILTIN_TEMPLATES}
            isPro={isPro}
          />
        )}

        {activeTab === 'analytics' && !selectedGoalId && !showCreateGoal && (
          <AnalyticsView
            goals={goals}
            checkedItems={checkedItems}
            completionLog={completionLog}
            streak={streak}
            currentWeek={currentWeek}
            darkMode={darkMode}
            lang={lang}
          />
        )}

        {/* ── Daily Goals (shown on home when navigating there) ── */}
        {activeTab === 'home' && !selectedGoalId && !showCreateGoal && (
          <div className="max-w-2xl mx-auto px-4 mt-4">
            <div className="rounded-2xl border border-violet-200 dark:border-violet-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  <div>
                    <h3 className="text-sm font-bold">{t.todaysGoals}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dailyGoals.length > 0 && (
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900 px-2 py-0.5 rounded-full">
                      {dailyGoals.filter((g) => g.done).length}/{dailyGoals.length}
                    </span>
                  )}
                  <button
                    onClick={() => setShowHistory((p) => !p)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showHistory ? t.listView : t.goalHistory}
                  </button>
                </div>
              </div>

              <div className="px-3 pb-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dailyGoalInput}
                    onChange={(e) => setDailyGoalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDailyGoal()}
                    placeholder={t.goalPlaceholder}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50 dark:bg-slate-800"
                  />
                  <button
                    onClick={addDailyGoal}
                    disabled={!dailyGoalInput.trim()}
                    className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t.addGoal}
                  </button>
                </div>
              </div>

              {dailyGoals.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="w-full bg-slate-200/60 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${Math.round((dailyGoals.filter((g) => g.done).length / dailyGoals.length) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {!showHistory ? (
                <div className="px-2 pb-2 space-y-0.5">
                  {dailyGoals.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400 italic">{t.noGoalsYet}</div>
                  ) : (
                    dailyGoals.map((goal) => (
                      <label
                        key={goal.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation select-none group ${
                          goal.done
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`flex-shrink-0 transition-transform duration-200 ${goal.done ? 'animate-bounce-check' : 'group-active:scale-90'}`}>
                          {goal.done ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-violet-400 transition-colors"><circle cx="12" cy="12" r="10"/></svg>
                          )}
                        </div>
                        <span className={`text-sm leading-tight flex-1 transition-all duration-200 ${goal.done ? 'text-slate-400 line-through decoration-2 decoration-emerald-300' : 'group-hover:text-slate-900'}`}>
                          {goal.text}
                        </span>
                        <button
                          onClick={(e) => { e.preventDefault(); removeDailyGoal(goal.id); }}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove goal"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                        <input type="checkbox" checked={goal.done} onChange={() => toggleDailyGoal(goal.id)} />
                      </label>
                    ))
                  )}
                </div>
              ) : (
                <div className="px-3 pb-3 space-y-2 max-h-64 overflow-y-auto">
                  {Object.keys(dailyGoalHistory).length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400 italic">{t.noHistoryYet}</div>
                  ) : (
                    Object.entries(dailyGoalHistory)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, data]) => (
                        <div key={date} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-600">
                              {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${data.completed === data.total ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {data.completed}/{data.total}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {data.goals.map((g, i) => (
                              <div key={i} className="flex items-center gap-2 text-[11px]">
                                {g.done ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><circle cx="12" cy="12" r="10"/></svg>
                                )}
                                <span className={g.done ? 'line-through text-slate-400' : 'text-slate-600'}>{g.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Quote ── */}
        {activeTab === 'home' && !selectedGoalId && !showCreateGoal && (
          <div className="max-w-2xl mx-auto px-4 mt-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 dark:from-blue-500/20 dark:to-emerald-500/20 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5 flex-shrink-0"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <p className="text-xs italic leading-relaxed">"{quote}"</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      {!selectedGoalId && !showCreateGoal && (
        <BottomNav
          active={activeTab}
          onNavigate={(tab) => handleNavigate(tab)}
          darkMode={darkMode}
        />
      )}

      {/* ── Paywall Modal ── */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} darkMode={darkMode} lang={lang} />
    </div>
  );
}
