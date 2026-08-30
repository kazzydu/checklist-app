import { Home, Sun, Target, BarChart3, MessageCircle } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'today', label: 'Today', Icon: Sun },
  { id: 'goals', label: 'Goals', Icon: Target },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
  { id: 'chat', label: 'Chat', Icon: MessageCircle },
];

export default function BottomNav({ active, onNavigate, darkMode }) {
  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        border-t
        ${darkMode
          ? 'border-white/10 bg-black/60'
          : 'border-slate-200/60 bg-white/60'
        }
        backdrop-blur-xl
        pb-safe
      `}
    >
      <div className="flex items-center justify-around px-2 pt-1">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                flex flex-1 flex-col items-center gap-0.5 py-2
                transition-colors duration-200
                ${isActive
                  ? 'text-blue-500'
                  : darkMode
                    ? 'text-slate-400'
                    : 'text-slate-400'
                }
              `}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
                className="transition-all duration-200"
              />
              <span
                className={`
                  text-[10px] leading-tight
                  ${isActive ? 'font-semibold' : 'font-medium'}
                `}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
