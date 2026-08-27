import { Plus, Target, Calendar, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function GoalsList({
  goals,
  darkMode,
  onViewGoal,
  onCreateGoal,
  onDeleteGoal,
  lang,
  isPro,
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const labels =
    lang === "es"
      ? {
          title: "MIS OBJETIVOS",
          emptyTitle: "Aún no hay objetivos",
          emptyDesc: "Comienza con una sola cosa que quieras lograr.",
          emptyBtn: "Crear Mi Primer Objetivo",
          freeHint:
            "Plan gratuito: 1 objetivo activo. Actualiza para ilimitado.",
          milestones: "hitos completados",
          deleteConfirm: "¿Eliminar este objetivo?",
          yes: "Sí",
          no: "No",
        }
      : {
          title: "MY GOALS",
          emptyTitle: "No goals yet",
          emptyDesc: "Start with one thing you want to accomplish.",
          emptyBtn: "Create Your First Goal",
          freeHint: "Free plan: 1 active goal. Upgrade for unlimited.",
          milestones: "milestones completed",
          deleteConfirm: "Delete this goal?",
          yes: "Yes",
          no: "No",
        };

  function getMilestoneProgress(milestones) {
    let completed = 0;
    let total = 0;
    milestones.forEach((m) => {
      m.tasks.forEach((t) => {
        total++;
        if (t.done) completed++;
      });
    });
    return { completed, total };
  }

  function getMilestoneMilestoneCount(milestones) {
    let completed = 0;
    milestones.forEach((m) => {
      const allDone = m.tasks.length > 0 && m.tasks.every((t) => t.done);
      if (allDone) completed++;
    });
    return { completed, total: milestones.length };
  }

  function handleDeleteClick(e, goalId) {
    e.stopPropagation();
    setConfirmDeleteId(goalId);
  }

  function confirmDelete(goalId) {
    setConfirmDeleteId(null);
    onDeleteGoal(goalId);
  }

  if (goals.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-20">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
              darkMode ? "bg-gray-800" : "bg-blue-50"
            }`}
          >
            <Target
              size={48}
              className={darkMode ? "text-blue-400" : "text-blue-500"}
            />
          </div>
          <h2
            className={`text-2xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {labels.emptyTitle}
          </h2>
          <p
            className={`mb-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            {labels.emptyDesc}
          </p>
          <button
            onClick={onCreateGoal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
          >
            {labels.emptyBtn}
          </button>
        </div>
        {!isPro && (
          <p
            className={`text-center text-sm mt-10 ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {labels.freeHint}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1
            className={`text-2xl font-extrabold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {labels.title}
          </h1>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {goals.length}
          </span>
        </div>
        <button
          onClick={onCreateGoal}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-colors duration-200 ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Goals list */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const taskProgress = getMilestoneProgress(goal.milestones || []);
          const milestoneCount = getMilestoneMilestoneCount(
            goal.milestones || []
          );
          const percentage =
            taskProgress.total > 0
              ? Math.round(
                  (taskProgress.completed / taskProgress.total) * 100
                )
              : 0;

          const isConfirming = confirmDeleteId === goal.id;

          return (
            <div
              key={goal.id}
              onClick={() => onViewGoal(goal.id)}
              className={`rounded-2xl border shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Goal icon */}
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: goal.color
                      ? `${goal.color}20`
                      : darkMode
                      ? "#1e3a5f"
                      : "#eff6ff",
                  }}
                >
                  {goal.icon || "🎯"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-bold text-base truncate ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isPro && isConfirming && (
                        <div className="flex items-center gap-1 mr-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(goal.id);
                            }}
                            className="text-xs px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
                          >
                            {labels.yes}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(null);
                            }}
                            className={`text-xs px-2 py-0.5 rounded ${
                              darkMode
                                ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            }`}
                          >
                            {labels.no}
                          </button>
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDeleteClick(e, goal.id)}
                        className={`p-1.5 rounded-lg transition-colors duration-150 ${
                          darkMode
                            ? "text-gray-500 hover:text-red-400 hover:bg-gray-700"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight
                        size={16}
                        className={
                          darkMode ? "text-gray-600" : "text-gray-300"
                        }
                      />
                    </div>
                  </div>

                  {goal.description && (
                    <p
                      className={`text-sm truncate mt-0.5 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {goal.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {goal.category && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {goal.category}
                      </span>
                    )}
                    {goal.targetDate && (
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Calendar size={12} />
                        {goal.targetDate}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {taskProgress.total > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {taskProgress.completed}/{taskProgress.total} tasks
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div
                        className={`w-full h-1.5 rounded-full ${
                          darkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <div
                          className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Milestones summary */}
                  {(goal.milestones || []).length > 0 && (
                    <p
                      className={`text-xs mt-2 ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {milestoneCount.completed}/{milestoneCount.total}{" "}
                      {labels.milestones}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Free tier hint */}
      {!isPro && (
        <p
          className={`text-center text-sm mt-8 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {labels.freeHint}
        </p>
      )}
    </div>
  );
}
