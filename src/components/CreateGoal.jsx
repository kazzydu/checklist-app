import { useState, useRef } from 'react';
import { X, Sparkles, Target, Calendar, ChevronRight } from 'lucide-react';
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
  GOAL_CATEGORIES,
} from '../data/constants';

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const translations = {
  en: {
    title: 'Create New Goal',
    save: 'Save',
    startFromTemplate: 'Start from a template',
    blankGoal: 'Blank Goal',
    goalName: 'Goal Name',
    goalNamePlaceholder: 'What do you want to achieve?',
    description: 'Description',
    descriptionPlaceholder: 'Optional — add more context…',
    targetDate: 'Target Date',
    category: 'Category',
    icon: 'Icon',
    color: 'Color',
    milestonesPreview: 'Milestones that will be created',
    youCanEdit: 'You can edit these after creating.',
    freeNotice: 'Free plan allows 1 active goal. Upgrade for unlimited.',
    required: 'Required',
  },
  es: {
    title: 'Crear Nuevo Objetivo',
    save: 'Guardar',
    startFromTemplate: 'Empezar con una plantilla',
    blankGoal: 'Objetivo en Blanco',
    goalName: 'Nombre del Objetivo',
    goalNamePlaceholder: '¿Qué quieres lograr?',
    description: 'Descripción',
    descriptionPlaceholder: 'Opcional — añade más contexto…',
    targetDate: 'Fecha Objetivo',
    category: 'Categoría',
    icon: 'Icono',
    color: 'Color',
    milestonesPreview: 'Hitos que se crearán',
    youCanEdit: 'Puedes editarlos después de crear.',
    freeNotice: 'El plan gratuito permite 1 objetivo activo. Actualiza para ilimitado.',
    required: 'Requerido',
  },
};

export default function CreateGoal({
  darkMode,
  onSave,
  onCancel,
  lang = 'en',
  builtinTemplates = [],
  isPro = false,
}) {
  const t = translations[lang] || translations.en;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('other');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('from-blue-500 to-indigo-600');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templateScrollRef = useRef(null);
  const iconScrollRef = useRef(null);

  function handleSelectTemplate(template) {
    setSelectedTemplate(template);
    if (template) {
      const firstKey = Object.keys(template.data)[0];
      if (firstKey) {
        const m = template.data[firstKey];
        setIcon(m.icon || '🎯');
        setColor(m.color || 'from-blue-500 to-indigo-600');
      }
    }
  }

  function handleSave() {
    if (!name.trim()) return;

    let milestones = [];
    if (selectedTemplate) {
      milestones = Object.entries(selectedTemplate.data).map(
        ([mName, mData], idx) => ({
          id: genId('ms'),
          name: mName,
          icon: mData.icon || '📌',
          color: mData.color || color,
          border: mData.border || '',
          month: mData.month || 1,
          order: idx,
          tasks: (mData.items || []).map((item, tIdx) => ({
            id: genId('tk'),
            text: item.text || '',
            done: false,
            week: item.week || 1,
            order: tIdx,
          })),
        })
      );
    }

    onSave({
      id: genId('goal'),
      name: name.trim(),
      description: description.trim(),
      targetDate,
      category,
      icon,
      color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      milestones,
    });
  }

  const templatePreviewMilestones = selectedTemplate
    ? Object.entries(selectedTemplate.data)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className={`relative flex flex-col h-full mt-auto rounded-t-3xl overflow-hidden ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
            darkMode
              ? 'border-gray-700 bg-gray-900'
              : 'border-gray-200 bg-white'
          }`}
        >
          <button
            onClick={onCancel}
            className={`p-2 rounded-xl transition-colors ${
              darkMode
                ? 'hover:bg-gray-800 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={22} />
          </button>

          <h2
            className={`text-lg font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {t.title}
          </h2>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
              name.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : darkMode
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t.save}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
          {/* Quick Start: Templates */}
          <section className="px-5 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles
                size={18}
                className={darkMode ? 'text-amber-400' : 'text-amber-500'}
              />
              <h3
                className={`text-sm font-bold uppercase tracking-wide ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t.startFromTemplate}
              </h3>
            </div>

            <div
              ref={templateScrollRef}
              className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Blank Goal card */}
              <button
                onClick={() => handleSelectTemplate(null)}
                className={`snap-start flex-shrink-0 w-28 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  !selectedTemplate
                    ? 'border-blue-500 bg-blue-500/10'
                    : darkMode
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  }`}
                >
                  <Target
                    size={20}
                    className={
                      !selectedTemplate
                        ? 'text-blue-500'
                        : darkMode
                        ? 'text-gray-400'
                        : 'text-gray-400'
                    }
                  />
                </div>
                <span
                  className={`text-xs font-semibold text-center leading-tight ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {t.blankGoal}
                </span>
              </button>

              {/* Template cards */}
              {builtinTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`snap-start flex-shrink-0 w-28 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    selectedTemplate?.name === tmpl.name
                      ? 'border-blue-500 bg-blue-500/10'
                      : darkMode
                      ? 'border-gray-700 hover:border-gray-600 bg-gray-800'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      darkMode ? 'bg-gray-700' : 'bg-white'
                    }`}
                  >
                    {tmpl.icon}
                  </div>
                  <span
                    className={`text-xs font-semibold text-center leading-tight ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Goal Details Form */}
          <section className="px-5 pt-5 space-y-5">
            {/* Goal Name */}
            <div>
              <label
                className={`block text-sm font-bold mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t.goalName} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.goalNamePlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-base font-medium outline-none transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className={`block text-sm font-bold mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border text-base outline-none transition-colors resize-none ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Target Date */}
            <div>
              <label
                className={`block text-sm font-bold mb-1.5 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {t.targetDate}
                </span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-base outline-none transition-colors ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Category */}
            <div>
              <label
                className={`block text-sm font-bold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t.category}
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                      category === cat.id
                        ? darkMode
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-blue-500 bg-blue-50 text-blue-700'
                        : darkMode
                        ? 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label
                className={`block text-sm font-bold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t.icon}
              </label>
              <div
                ref={iconScrollRef}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {ICON_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setIcon(emoji)}
                    className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${
                      icon === emoji
                        ? 'border-blue-500 bg-blue-500/10 scale-110'
                        : darkMode
                        ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label
                className={`block text-sm font-bold mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {t.color}
              </label>
              <div className="flex gap-3 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.value} border-2 transition-all ${
                      color === c.value
                        ? 'border-white ring-2 ring-blue-500 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Milestones Preview (template selected) */}
          {selectedTemplate && templatePreviewMilestones.length > 0 && (
            <section className="px-5 pt-6">
              <h3
                className={`text-sm font-bold uppercase tracking-wide mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t.milestonesPreview}
              </h3>
              <div className="space-y-2">
                {templatePreviewMilestones.map(([mName, mData], idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      darkMode
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{mData.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm font-semibold truncate block ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {mName}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium flex-shrink-0 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {(mData.items || []).length} tasks
                    </span>
                  </div>
                ))}
              </div>
              <p
                className={`text-xs mt-2 flex items-center gap-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                <ChevronRight size={12} />
                {t.youCanEdit}
              </p>
            </section>
          )}

          {/* Free tier notice */}
          {!isPro && (
            <div className="px-5 pt-6">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  darkMode
                    ? 'bg-amber-950/20 border-amber-800/40'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <span className="text-lg">⭐</span>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? 'text-amber-300' : 'text-amber-700'
                  }`}
                >
                  {t.freeNotice}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
