import { CheckCircle2, Circle, Sun, Flame, CheckCircle } from "lucide-react";

function formatTodayDate() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

export default function TodayScreen({ goals, currentWeek, onToggleTask, darkMode, streak, completionLog, onNavigate }) {
  const weekTasks = [];
  let totalWeekTasks = 0;
  let completedWeekTasks = 0;

  goals.forEach((goal) => {
    goal.milestones.forEach((ms) => {
      ms.tasks.forEach((task) => {
        if (task.week === currentWeek) {
          totalWeekTasks++;
          if (task.done) completedWeekTasks++;
          weekTasks.push({ ...task, goalId: goal.id, milestoneId: ms.id, goalName: goal.name, goalIcon: goal.icon, goalColor: goal.color });
        }
      });
    });
  });

  const remainingTasks = totalWeekTasks - completedWeekTasks;
  const weekProgress = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;
  const allDone = remainingTasks === 0 && totalWeekTasks > 0;

  const grouped = {};
  weekTasks.forEach((task) => {
    if (!task.done) {
      if (!grouped[task.goalId]) {
        grouped[task.goalId] = { name: task.goalName, icon: task.goalIcon, color: task.goalColor, incomplete: [], complete: [] };
      }
      grouped[task.goalId].incomplete.push(task);
    }
  });

  weekTasks.forEach((task) => {
    if (task.done && grouped[task.goalId]) {
      grouped[task.goalId].complete.push(task);
    }
  });

  goals.forEach((goal) => {
    const hasIncomplete = weekTasks.some((t) => t.goalId === goal.id && !t.done);
    if (!hasIncomplete && !grouped[goal.id]) {
      const goalComplete = weekTasks.filter((t) => t.goalId === goal.id && t.done);
      if (goalComplete.length > 0) {
        grouped[goal.id] = { name: goal.name, icon: goal.icon, color: goal.color, incomplete: [], complete: goalComplete };
      }
    }
  });

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className={`text-3xl font-extrabold tracking-tight ${darkMode ? "text-white" : "text-gray-900"}`}>
              TODAY
            </h1>
            {streak > 0 && (
              <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/40 px-3 py-1.5 rounded-full">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600">{streak} day streak</span>
              </div>
            )}
          </div>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{formatTodayDate()}</p>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-5 mb-6 shadow-sm`}>
          <div className="flex items-center gap-2 mb-3">
            <Sun className={`w-5 h-5 ${darkMode ? "text-yellow-400" : "text-yellow-500"}`} />
            <span className={`font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
              {remainingTasks} task{remainingTasks !== 1 ? "s" : ""} remaining this week
            </span>
          </div>

          <div className={`w-full h-3 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"} mb-3`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${weekProgress}%` }}
            />
          </div>

          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {remainingTasks > 0
              ? `You're ${remainingTasks} task${remainingTasks !== 1 ? "s" : ""} away from completing this week's milestone.`
              : "This week's milestone is complete. Great job!"}
          </p>
        </div>

        {allDone ? (
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-10 text-center shadow-sm`}>
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              You're all caught up for this week!
            </h2>
            <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Great work. Keep the momentum going.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([goalId, group]) => (
              <div key={goalId}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-lg">{group.icon}</span>
                  <h3 className={`font-bold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{group.name}</h3>
                </div>

                <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-sm overflow-hidden`}>
                  {group.incomplete.map((task, i) => (
                    <button
                      key={task.id}
                      onClick={() => onToggleTask(task.goalId, task.milestoneId, task.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${
                        i > 0 ? `border-t ${darkMode ? "border-gray-700" : "border-gray-100"}` : ""
                      } ${darkMode ? "active:bg-gray-700" : "active:bg-gray-50"}`}
                    >
                      <Circle className={`w-7 h-7 flex-shrink-0 ${darkMode ? "text-gray-500" : "text-gray-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{task.text}</p>
                      </div>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${group.goalColor}20`, color: group.goalColor }}
                      >
                        W{task.week}
                      </span>
                    </button>
                  ))}

                  {group.complete.map((task, i) => (
                    <button
                      key={task.id}
                      onClick={() => onToggleTask(task.goalId, task.milestoneId, task.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left opacity-40 transition-opacity ${
                        group.incomplete.length > 0 || i > 0
                          ? `border-t ${darkMode ? "border-gray-700" : "border-gray-100"}`
                          : ""
                      } ${darkMode ? "active:bg-gray-700" : "active:bg-gray-50"}`}
                    >
                      <CheckCircle2 className={`w-7 h-7 flex-shrink-0 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium line-through ${darkMode ? "text-gray-200" : "text-gray-800"}`}>{task.text}</p>
                      </div>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${group.goalColor}20`, color: group.goalColor }}
                      >
                        W{task.week}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
