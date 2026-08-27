const GOALS_KEY = 'msm_goals';
const OLD_CHECKLIST_KEY = 'allOnDeckChecklist';
const OLD_CHECKED_KEY = 'allOnDeckCheckedItems';

export function generateId() {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `goal_${ts}_${rand}`;
}

export function getStoredGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function migrateOldChecklistToGoals(oldChecklistData, oldCheckedItems = {}) {
  if (!oldChecklistData || typeof oldChecklistData !== 'object') {
    return [];
  }

  const now = Date.now();

  const milestones = Object.entries(oldChecklistData).map(([fullName, categoryData]) => {
    const { icon = '📋', color = 'from-gray-500 to-gray-600', border = 'border-gray-200 dark:border-gray-800', month = 1, items = [] } = categoryData;

    const name = fullName.replace(/^[^\s]+\s/, '');

    const tasks = items.map((item, i) => {
      const taskKey = `${fullName}-${item.text}-${item.week}-${i}`;
      const taskDone = oldCheckedItems[taskKey] === true;

      return {
        id: `task_${now}_${i}`,
        text: item.text,
        week: item.week || 1,
        done: taskDone,
        createdAt: now,
      };
    });

    return {
      id: `ms_${now}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      icon,
      color,
      border,
      month,
      tasks,
    };
  });

  const goal = {
    id: generateId(),
    name: 'My 3-Month Semester Plan',
    description: 'Migrated from old checklist data',
    targetDate: '',
    category: 'education',
    icon: '📋',
    color: 'from-blue-500 to-emerald-500',
    createdAt: now,
    updatedAt: now,
    milestones,
  };

  return [goal];
}

export function migrateCheckedItems(goals) {
  const checkedItems = {};

  if (!Array.isArray(goals)) return checkedItems;

  goals.forEach((goal) => {
    if (!goal.milestones || !Array.isArray(goal.milestones)) return;

    goal.milestones.forEach((milestone) => {
      if (!milestone.tasks || !Array.isArray(milestone.tasks)) return;

      milestone.tasks.forEach((task) => {
        const key = `${goal.id}-${task.id}`;
        checkedItems[key] = task.done === true;
      });
    });
  });

  return checkedItems;
}

export function migrateIfNeeded() {
  const existingGoals = getStoredGoals();
  if (existingGoals.length > 0) {
    return existingGoals;
  }

  try {
    const oldRaw = localStorage.getItem(OLD_CHECKLIST_KEY);
    if (!oldRaw) return [];

    const oldData = JSON.parse(oldRaw);
    if (!oldData || typeof oldData !== 'object') return [];

    let oldChecked = {};
    const checkedRaw = localStorage.getItem(OLD_CHECKED_KEY);
    if (checkedRaw) {
      oldChecked = JSON.parse(checkedRaw);
    }

    const goals = migrateOldChecklistToGoals(oldData, oldChecked);
    if (goals.length > 0) {
      saveStoredGoals(goals);
    }

    return goals;
  } catch {
    return [];
  }
}
