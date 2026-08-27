import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Save,
  X,
  Calendar,
  Trophy,
} from 'lucide-react';

const TOTAL_WEEKS = 12;

function GoalDetail({ goal, darkMode, onBack, onUpdateGoal, currentWeek, lang }) {
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(goal.name);
  const [editDescription, setEditDescription] = useState(goal.description || '');
  const [expandedMilestones, setExpandedMilestones] = useState(
    () => new Set(goal.milestones.map((m) => m.id))
  );

  const [newMilestone, setNewMilestone] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [editingGoal, setEditingGoal] = useState(false);

  const newMilestoneInputRef = useRef(null);

  useEffect(() => {
    if (newMilestone && newMilestoneInputRef.current) {
      newMilestoneInputRef.current.focus();
    }
  }, [newMilestone]);

  const toggleMilestone = (id) => {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedMilestones(new Set(goal.milestones.map((m) => m.id)));
  };

  const collapseAll = () => {
    setExpandedMilestones(new Set());
  };

  const totalTasks = goal.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = goal.milestones.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.done).length,
    0
  );
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getWeekUrgency = (week) => {
    if (!week || week <= 0) return 'normal';
    const diff = week - currentWeek;
    if (diff < 0) return 'overdue';
    if (diff <= 1) return 'urgent';
    if (diff <= 2) return 'approaching';
    return 'normal';
  };

  const urgencyColor = (urgency) => {
    switch (urgency) {
      case 'overdue':
        return darkMode ? 'text-red-400' : 'text-red-600';
      case 'urgent':
        return darkMode ? 'text-orange-400' : 'text-orange-600';
      case 'approaching':
        return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return darkMode ? 'text-gray-400' : 'text-gray-500';
    }
  };

  const handleMarkAchieved = () => {
    const achieved = !goal.achieved;
    const achievedAt = achieved ? new Date().toISOString() : null;
    onUpdateGoal({
      ...goal,
      achieved,
      achievedAt,
    });
  };

  const handleSaveGoal = () => {
    onUpdateGoal({
      ...goal,
      name: editName,
      description: editDescription,
    });
    setEditingGoal(false);
  };

  const handleAddMilestone = () => {
    const id = Date.now().toString();
    setNewMilestone({
      id,
      name: '',
      icon: '🎯',
      color: goal.color || '#6366f1',
      border: '2px solid rgba(99,102,241,0.3)',
      month: goal.milestones.length + 1,
      tasks: [],
    });
  };

  const handleSaveNewMilestone = () => {
    if (!newMilestone.name.trim()) return;
    onUpdateGoal({
      ...goal,
      milestones: [...goal.milestones, newMilestone],
    });
    setNewMilestone(null);
  };

  const handleDeleteMilestone = (milestoneId) => {
    onUpdateGoal({
      ...goal,
      milestones: goal.milestones.filter((m) => m.id !== milestoneId),
    });
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      next.delete(milestoneId);
      return next;
    });
  };

  const handleAddTask = (milestoneId) => {
    const id = Date.now().toString();
    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    const updatedMilestones = goal.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          tasks: [
            ...m.tasks,
            {
              id,
              text: '',
              week: currentWeek,
              done: false,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return m;
    });
    onUpdateGoal({ ...goal, milestones: updatedMilestones });
    setEditingTask({ milestoneId, taskId: id });
  };

  const handleUpdateTask = (milestoneId, taskId, updates) => {
    const updatedMilestones = goal.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        };
      }
      return m;
    });
    onUpdateGoal({ ...goal, milestones: updatedMilestones });
  };

  const handleDeleteTask = (milestoneId, taskId) => {
    const updatedMilestones = goal.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          tasks: m.tasks.filter((t) => t.id !== taskId),
        };
      }
      return m;
    });
    onUpdateGoal({ ...goal, milestones: updatedMilestones });
  };

  const handleToggleTask = (milestoneId, taskId) => {
    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    const task = milestone?.tasks.find((t) => t.id === taskId);
    if (task) {
      handleUpdateTask(milestoneId, taskId, { done: !task.done });
    }
  };

  const handleMoveMilestone = (milestoneId, direction) => {
    const idx = goal.milestones.findIndex((m) => m.id === milestoneId);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= goal.milestones.length) return;
    const arr = [...goal.milestones];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onUpdateGoal({ ...goal, milestones: arr });
  };

  const handleMoveTask = (milestoneId, taskId, direction) => {
    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;
    const idx = milestone.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= milestone.tasks.length) return;
    const tasks = [...milestone.tasks];
    [tasks[idx], tasks[newIdx]] = [tasks[newIdx], tasks[idx]];
    handleUpdateTask(milestoneId, milestoneId, {});
    const updatedMilestones = goal.milestones.map((m) => {
      if (m.id === milestoneId) return { ...m, tasks };
      return m;
    });
    onUpdateGoal({ ...goal, milestones: updatedMilestones });
  };

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-100';

  return (
    <div className={`min-h-screen ${bg} ${textPrimary}`}>
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-50 ${cardBg} border-b ${borderColor} px-4 py-3 flex items-center gap-3`}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="text-2xl">{goal.icon}</span>
        <h1 className="flex-1 text-lg font-bold truncate">{goal.name}</h1>
        <button
          onClick={() => {
            if (editingGoal) handleSaveGoal();
            else {
              setEditName(goal.name);
              setEditDescription(goal.description || '');
            }
            setEditingGoal(!editingGoal);
          }}
          className={`p-2 rounded-xl transition-colors ${
            editingGoal
              ? 'bg-indigo-500 text-white'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          aria-label={editingGoal ? 'Save' : 'Edit'}
        >
          {editingGoal ? <Save size={20} /> : <Pencil size={20} />}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Goal Summary Card */}
        <div className={`${cardBg} rounded-2xl p-5 border ${borderColor} shadow-sm`}>
          {editingGoal ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl ${inputBg} ${textPrimary} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold`}
                placeholder={lang === 'es' ? 'Nombre del objetivo' : 'Goal name'}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl ${inputBg} ${textPrimary} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
                placeholder={lang === 'es' ? 'Descripción' : 'Description'}
              />
            </div>
          ) : (
            <p className={`${textSecondary} text-sm mb-3 leading-relaxed`}>
              {goal.description || (lang === 'es' ? 'Sin descripción' : 'No description')}
            </p>
          )}

          <div className={`flex items-center gap-2 text-sm ${textMuted} mb-3`}>
            <Calendar size={14} />
            <span>
              {lang === 'es' ? 'Fecha objetivo' : 'Target date'}:{' '}
              {goal.targetDate
                ? new Date(goal.targetDate).toLocaleDateString()
                : '—'}
            </span>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{progress}%</span>
              <span className={`text-xs ${textMuted}`}>
                {lang === 'es'
                  ? `${completedTasks} de ${totalTasks} tareas completadas`
                  : `${completedTasks} of ${totalTasks} tasks completed`}
              </span>
            </div>
            <div
              className={`w-full h-3 rounded-full overflow-hidden ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: goal.color || '#6366f1',
                }}
              />
            </div>
          </div>

          {/* Achieve Button */}
          <button
            onClick={handleMarkAchieved}
            className={`w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              goal.achieved
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                : progress === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 animate-pulse'
                : darkMode
                ? 'bg-gray-700 text-gray-400 border border-gray-600 hover:border-amber-500 hover:text-amber-400'
                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            <Trophy size={18} />
            {goal.achieved
              ? lang === 'es'
                ? 'Logrado!'
                : 'Achieved!'
              : progress === 100
              ? lang === 'es'
                ? 'Marcar como Logrado'
                : 'Mark as Achieved'
              : lang === 'es'
              ? 'Marcar cuando se complete'
              : 'Mark when complete'}
          </button>
          {goal.achieved && goal.achievedAt && (
            <p className={`text-center text-xs mt-2 ${textMuted}`}>
              {lang === 'es'
                ? `Logrado el ${new Date(goal.achievedAt).toLocaleDateString()}`
                : `Achieved on ${new Date(goal.achievedAt).toLocaleDateString()}`}
            </p>
          )}
        </div>

        {/* Milestones */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold">
            {lang === 'es' ? 'Hitos' : 'Milestones'} ({goal.milestones.length})
          </h2>
          <div className="flex gap-1">
            <button
              onClick={expandAll}
              className={`text-xs px-2.5 py-1 rounded-lg ${textMuted} hover:${textSecondary} transition-colors`}
            >
              {lang === 'es' ? 'Expandir' : 'Expand'}
            </button>
            <button
              onClick={collapseAll}
              className={`text-xs px-2.5 py-1 rounded-lg ${textMuted} hover:${textSecondary} transition-colors`}
            >
              {lang === 'es' ? 'Contraer' : 'Collapse'}
            </button>
          </div>
        </div>

        {goal.milestones.map((milestone) => {
          const mTotal = milestone.tasks.length;
          const mDone = milestone.tasks.filter((t) => t.done).length;
          const mProgress = mTotal > 0 ? Math.round((mDone / mTotal) * 100) : 0;
          const isExpanded = expandedMilestones.has(milestone.id);
          const mIdx = goal.milestones.findIndex((m) => m.id === milestone.id);

          return (
            <div
              key={milestone.id}
              className={`${cardBg} rounded-2xl border overflow-hidden transition-all duration-300`}
              style={{ borderColor: milestone.border || borderColor }}
            >
              {/* Milestone Header */}
              <button
                onClick={() => toggleMilestone(milestone.id)}
                className={`w-full flex items-center gap-3 p-4 ${
                  isExpanded ? 'border-b ' + borderColor : ''
                }`}
              >
                {editMode && (
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveMilestone(milestone.id, -1);
                      }}
                      disabled={mIdx === 0}
                      className={`p-0.5 rounded ${mIdx === 0 ? 'opacity-30' : textMuted}`}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveMilestone(milestone.id, 1);
                      }}
                      disabled={mIdx === goal.milestones.length - 1}
                      className={`p-0.5 rounded ${
                        mIdx === goal.milestones.length - 1 ? 'opacity-30' : textMuted
                      }`}
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                )}
                <span className="text-xl">{milestone.icon}</span>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm truncate">{milestone.name}</div>
                  <div className={`text-xs ${textMuted}`}>
                    {mDone}/{mTotal}{' '}
                    {lang === 'es' ? 'tareas' : 'tasks'}
                  </div>
                </div>
                <div className="w-16 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${mProgress}%`,
                      backgroundColor: milestone.color || '#6366f1',
                    }}
                  />
                </div>
                {isExpanded ? (
                  <ChevronUp size={18} className={textMuted} />
                ) : (
                  <ChevronDown size={18} className={textMuted} />
                )}
              </button>

              {/* Expanded Tasks */}
              {isExpanded && (
                <div className="p-3 space-y-1.5 animate-fadeIn">
                  {milestone.tasks.length === 0 && (
                    <p className={`text-xs text-center py-3 ${textMuted}`}>
                      {lang === 'es' ? 'No hay tareas aún' : 'No tasks yet'}
                    </p>
                  )}
                  {milestone.tasks.map((task, tIdx) => {
                    const urgency = getWeekUrgency(task.week);
                    const isEditing =
                      editingTask?.milestoneId === milestone.id &&
                      editingTask?.taskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl ${
                          task.done
                            ? 'opacity-60'
                            : urgency === 'overdue'
                            ? darkMode
                              ? 'bg-red-900/20 border border-red-800/40'
                              : 'bg-red-50 border border-red-200'
                            : ''
                        } ${editMode ? 'border border-dashed ' + borderColor : ''}`}
                      >
                        {editMode && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() =>
                                handleMoveTask(milestone.id, task.id, -1)
                              }
                              disabled={tIdx === 0}
                              className={`p-0.5 rounded ${tIdx === 0 ? 'opacity-30' : textMuted}`}
                            >
                              <ChevronUp size={10} />
                            </button>
                            <button
                              onClick={() =>
                                handleMoveTask(milestone.id, task.id, 1)
                              }
                              disabled={tIdx === milestone.tasks.length - 1}
                              className={`p-0.5 rounded ${
                                tIdx === milestone.tasks.length - 1
                                  ? 'opacity-30'
                                  : textMuted
                              }`}
                            >
                              <ChevronDown size={10} />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleToggleTask(milestone.id, task.id)}
                          className="flex-shrink-0 p-1"
                        >
                          {task.done ? (
                            <CheckCircle2 size={20} className="text-green-500" />
                          ) : (
                            <Circle size={20} className={textMuted} />
                          )}
                        </button>

                        {isEditing ? (
                          <input
                            autoFocus
                            type="text"
                            value={task.text}
                            onChange={(e) =>
                              handleUpdateTask(milestone.id, task.id, {
                                text: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingTask(null);
                            }}
                            className={`flex-1 min-w-0 px-3 py-1.5 rounded-lg ${inputBg} ${textPrimary} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                          />
                        ) : (
                          <span
                            className={`flex-1 min-w-0 text-sm ${
                              task.done ? 'line-through' : ''
                            }`}
                            onClick={() =>
                              setEditingTask({
                                milestoneId: milestone.id,
                                taskId: task.id,
                              })
                            }
                          >
                            {task.text ||
                              (lang === 'es' ? 'Tarea sin nombre' : 'Untitled task')}
                          </span>
                        )}

                        {task.week > 0 && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              urgency === 'overdue'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                : urgency === 'urgent'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                : urgency === 'approaching'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                                : darkMode
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            W{task.week}
                          </span>
                        )}

                        {editMode && (
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() =>
                                setEditingTask({
                                  milestoneId: milestone.id,
                                  taskId: task.id,
                                })
                              }
                              className={`p-1.5 rounded-lg ${textMuted} hover:bg-gray-200 dark:hover:bg-gray-700`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteTask(milestone.id, task.id)
                              }
                              className={`p-1.5 rounded-lg ${textMuted} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Task Button */}
                  <button
                    onClick={() => handleAddTask(milestone.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed ${borderColor} ${textMuted} text-sm font-medium hover:border-indigo-400 hover:text-indigo-500 transition-colors`}
                  >
                    <Plus size={16} />
                    {lang === 'es' ? 'Agregar tarea' : 'Add Task'}
                  </button>

                  {editMode && (
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                      {lang === 'es' ? 'Eliminar hito' : 'Delete milestone'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Milestone */}
        {newMilestone ? (
          <div className={`${cardBg} rounded-2xl p-4 border ${borderColor} shadow-sm space-y-3`}>
            <div className="flex items-center gap-2">
              <input
                ref={newMilestoneInputRef}
                type="text"
                value={newMilestone.name}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, name: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveNewMilestone();
                  if (e.key === 'Escape') setNewMilestone(null);
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl ${inputBg} ${textPrimary} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
                placeholder={lang === 'es' ? 'Nombre del hito' : 'Milestone name'}
              />
              <div className="flex gap-1">
                {['🎯', '🚀', '🏆', '⚡', '🔥', '💡', '📌', '⭐'].map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewMilestone({ ...newMilestone, icon })}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                      newMilestone.icon === icon
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500 scale-110'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveNewMilestone}
                disabled={!newMilestone.name.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  newMilestone.name.trim()
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save size={16} />
                {lang === 'es' ? 'Guardar' : 'Save'}
              </button>
              <button
                onClick={() => setNewMilestone(null)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium ${textMuted} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddMilestone}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed ${borderColor} ${textMuted} font-medium hover:border-indigo-400 hover:text-indigo-500 transition-colors`}
          >
            <Plus size={18} />
            {lang === 'es' ? 'Agregar hito' : 'Add Milestone'}
          </button>
        )}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}

export default GoalDetail;
