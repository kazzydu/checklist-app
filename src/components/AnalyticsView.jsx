import { TrendingUp, Target, Flame, Calendar, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function AnalyticsView({
  goals = [],
  completionLog = [],
  streak = 0,
  currentWeek = 1,
  darkMode = false,
  lang = 'en',
}) {
  const t = lang === 'es' ? {
    title: 'PROGRESO',
    subtitle: 'Sigue tu crecimiento',
    totalCompleted: 'Tareas completadas',
    overallPercent: 'Porcentaje total',
    avgPerWeek: 'Promedio por semana',
    currentStreak: 'Racha actual',
    tasksCompleted: 'tareas completadas',
    milestonesCompleted: 'hitos completados',
    weeklyActivity: 'Actividad semanal',
    todayActivity: 'Actividad de hoy',
    tasksDone: 'Tareas completadas hoy',
    tasksUnchecked: 'Tareas pendientes hoy',
    totalActions: 'Acciones totales hoy',
    projectedFinish: 'Finalización proyectada',
    basedOnPace: 'Basado en ritmo actual',
    estimatedDate: 'Fecha estimada',
    noGoals: 'Agrega objetivos para ver progreso',
    w1: 'S1', w2: 'S2', w3: 'S3', w4: 'S4', w5: 'S5', w6: 'S6', w7: 'S7', w8: 'S8',
  } : {
    title: 'PROGRESS',
    subtitle: 'Track your growth',
    totalCompleted: 'Tasks completed',
    overallPercent: 'Overall completion',
    avgPerWeek: 'Avg per week',
    currentStreak: 'Current streak',
    tasksCompleted: 'tasks completed',
    milestonesCompleted: 'milestones completed',
    weeklyActivity: 'Weekly Activity',
    todayActivity: "Today's Activity",
    tasksDone: 'Tasks completed today',
    tasksUnchecked: 'Tasks unchecked today',
    totalActions: 'Total actions today',
    projectedFinish: 'Projected Finish',
    basedOnPace: 'Based on current pace',
    estimatedDate: 'Estimated date',
    noGoals: 'Add goals to see progress',
    w1: 'W1', w2: 'W2', w3: 'W3', w4: 'W4', w5: 'W5', w6: 'W6', w7: 'W7', w8: 'W8',
  };

  const stats = useMemo(() => {
    let totalTasks = 0;
    let doneTasks = 0;
    const goalStats = goals.map(goal => {
      let gTotal = 0;
      let gDone = 0;
      const gMilestonesTotal = goal.milestones.length;
      let gMilestonesDone = 0;

      goal.milestones.forEach(m => {
        let mDone = true;
        m.tasks.forEach(task => {
          gTotal++;
          if (task.done) gDone++;
          else mDone = false;
        });
        if (mDone && m.tasks.length > 0) gMilestonesDone++;
      });

      totalTasks += gTotal;
      doneTasks += gDone;

      return {
        ...goal,
        totalTasks: gTotal,
        doneTasks: gDone,
        totalMilestones: gMilestonesTotal,
        doneMilestones: gMilestonesDone,
        percent: gTotal > 0 ? Math.round((gDone / gTotal) * 100) : 0,
      };
    });

    const overallPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const avgPerWeek = currentWeek > 0 ? (doneTasks / currentWeek).toFixed(1) : '0';

    const today = new Date().toISOString().split('T')[0];
    const todayLog = completionLog.filter(e => {
      const d = new Date(e.ts).toISOString().split('T')[0];
      return d === today;
    });
    const todayDone = todayLog.filter(e => e.done).length;
    const todayUndone = todayLog.filter(e => !e.done).length;
    const todayTotal = todayDone + todayUndone;

    const weekBuckets = {};
    for (let i = 0; i < 8; i++) {
      const wk = currentWeek - 7 + i;
      if (wk >= 1) weekBuckets[wk] = 0;
    }
    completionLog.forEach(entry => {
      const wk = Math.ceil(((new Date(entry.ts).getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000) + 1);
      if (weekBuckets[wk] !== undefined && entry.done) {
        weekBuckets[wk]++;
      }
    });
    const weeklyCounts = Object.entries(weekBuckets)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => v);

    const perGoalWeekly = goalStats.map(gs => {
      const buckets = {};
      for (let i = 0; i < 8; i++) {
        const wk = currentWeek - 7 + i;
        if (wk >= 1) buckets[wk] = 0;
      }
      completionLog.forEach(entry => {
        if (entry.cat === gs.id && entry.done) {
          const wk = Math.ceil(((new Date(entry.ts).getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000) + 1);
          if (buckets[wk] !== undefined) buckets[wk]++;
        }
      });
      return Object.entries(buckets)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([, v]) => v);
    });

    let projectedDate = null;
    const remaining = totalTasks - doneTasks;
    const pace = Number(avgPerWeek);
    if (pace > 0 && remaining > 0) {
      const weeksNeeded = remaining / pace;
      const now = new Date();
      projectedDate = new Date(now.getTime() + weeksNeeded * 7 * 86400000);
    }

    return {
      goalStats,
      totalTasks,
      doneTasks,
      overallPercent,
      avgPerWeek,
      todayDone,
      todayUndone,
      todayTotal,
      weeklyCounts,
      perGoalWeekly,
      projectedDate,
    };
  }, [goals, completionLog, currentWeek]);

  const maxWeekly = Math.max(...stats.weeklyCounts, 1);

  const weekLabels = [t.w1, t.w2, t.w3, t.w4, t.w5, t.w6, t.w7, t.w8];

  const baseText = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">{t.title}</h1>
        <p className={`mt-1 ${subText}`}>{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          label={t.totalCompleted}
          value={`${stats.doneTasks}/${stats.totalTasks}`}
          cardBg={cardBg}
          baseText={baseText}
          subText={subText}
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-blue-500" />}
          label={t.overallPercent}
          value={`${stats.overallPercent}%`}
          cardBg={cardBg}
          baseText={baseText}
          subText={subText}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          label={t.avgPerWeek}
          value={stats.avgPerWeek}
          cardBg={cardBg}
          baseText={baseText}
          subText={subText}
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label={t.currentStreak}
          value={streak}
          cardBg={cardBg}
          baseText={baseText}
          subText={subText}
        />
      </div>

      <div className="mb-8">
        <h2 className={`text-lg font-bold mb-3 ${baseText}`}>{t.weeklyActivity}</h2>
        <div className={`rounded-2xl shadow-sm border p-4 ${cardBg}`}>
          <div className="flex items-end gap-1 h-32">
            {stats.weeklyCounts.map((count, i) => {
              const h = maxWeekly > 0 ? (count / maxWeekly) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-semibold ${subText}`}>{count}</span>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(h, 2)}%`,
                      background: 'linear-gradient(to top, #a855f7, #ec4899)',
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-1 mt-2">
            {stats.weeklyCounts.map((_, i) => (
              <span key={i} className={`flex-1 text-center text-[10px] ${subText}`}>
                {weekLabels[i]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className={`text-lg font-bold mb-3 ${baseText}`}>{t.todayActivity}</h2>
        <div className={`rounded-2xl shadow-sm border p-4 ${cardBg}`}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">{stats.todayDone}</div>
              <div className={`text-xs ${subText}`}>{t.tasksDone}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">{stats.todayUndone}</div>
              <div className={`text-xs ${subText}`}>{t.tasksUnchecked}</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{stats.todayTotal}</div>
              <div className={`text-xs ${subText}`}>{t.totalActions}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className={`text-lg font-bold mb-3 ${baseText}`}>{t.projectedFinish}</h2>
        <div className={`rounded-2xl shadow-sm border p-4 flex items-center gap-3 ${cardBg}`}>
          <Calendar className="w-8 h-8 text-purple-500 flex-shrink-0" />
          <div>
            {stats.projectedDate ? (
              <>
                <div className={`font-semibold ${baseText}`}>
                  {stats.projectedDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className={`text-xs ${subText}`}>{t.basedOnPace}</div>
              </>
            ) : (
              <div className={`font-semibold ${subText}`}>
                {stats.doneTasks === stats.totalTasks ? '✓' : '—'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className={`text-lg font-bold mb-3 ${baseText}`}>{t.title}</h2>
        {stats.goalStats.length === 0 ? (
          <div className={`rounded-2xl shadow-sm border p-6 text-center ${cardBg}`}>
            <p className={subText}>{t.noGoals}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {stats.goalStats.map((gs, idx) => (
              <div key={gs.id} className={`rounded-2xl shadow-sm border p-4 ${cardBg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{gs.icon}</span>
                  <span className={`font-bold ${baseText}`}>{gs.name}</span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-3xl font-extrabold"
                    style={{ color: gs.color || '#a855f7' }}
                  >
                    {gs.percent}%
                  </span>
                  <div className="flex-1">
                    <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${gs.percent}%`,
                          background: `linear-gradient(to right, ${gs.color || '#a855f7'}, ${gs.color || '#ec4899'}88)`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={`flex gap-4 text-xs ${subText} mb-3`}>
                  <span>{gs.doneTasks}/{gs.totalTasks} {t.tasksCompleted}</span>
                  <span>{gs.doneMilestones}/{gs.totalMilestones} {t.milestonesCompleted}</span>
                </div>

                {stats.perGoalWeekly[idx] && (
                  <div className="flex items-end gap-0.5 h-10">
                    {stats.perGoalWeekly[idx].map((count, wi) => {
                      const localMax = Math.max(...stats.perGoalWeekly[idx], 1);
                      const h = (count / localMax) * 100;
                      return (
                        <div
                          key={wi}
                          className="flex-1 rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${Math.max(h, count > 0 ? 12 : 2)}%`,
                            background: `linear-gradient(to top, ${gs.color || '#a855f7'}, ${gs.color || '#ec4899'}88)`,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, cardBg, baseText, subText }) {
  return (
    <div className={`rounded-2xl shadow-sm border p-4 ${cardBg}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className={`text-xs ${subText}`}>{label}</span>
      </div>
      <div className={`text-xl font-bold ${baseText}`}>{value}</div>
    </div>
  );
}
