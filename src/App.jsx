import { useState, useEffect } from 'react';
import { Download, CheckCircle2, Circle } from 'lucide-react';

const checklistData = {
  "📘 ESL GPA Improvement": [
    "ESL assignments completed",
    "Rewrite graded work for clarity",
    "Reading exercise",
    "Writing practice",
    "Learn 5 new vocabulary words",
    "Attend class",
    "GPA milestone: 1.7 → 2.3",
    "GPA milestone: 2.3 → 2.8",
    "GPA milestone: 2.8 → 3.0+"
  ],
  "🎓 Transfer Positioning": [
    "CV updated",
    "Scholarship résumé updated",
    "Transcripts organized",
    "Certifications organized",
    "Email HCU admissions",
    "Email HCU tennis coach",
    "Email DBU admissions",
    "Email TWU admissions",
    "Follow-up sent",
    "Visit HCU campus",
    "Transfer timeline created",
    "Scholarship package prepared"
  ],
  "🚗 Driving License (Updated)": [
    "Choose driving school",
    "Schedule 1-hour actual driving test",
    "Take the test",
    "Pass the test",
    "Get certificate",
    "Go to DPS",
    "Receive license"
  ],
  "🧠 Emotional Regulation": [
    "Daily reflection",
    "Weekly reset",
    "Reduce stress triggers",
    "Maintain sleep routine",
    "Gym/fitness session"
  ],
  "💼 Business Progress": [
    "Choose ONE main project",
    "SleekTechSport weekly review",
    "Feature 1 completed",
    "Feature 2 completed",
    "Feature 3 completed",
    "Debugger MVP ready",
    "Test webhook logs",
    "Landing page created",
    "Pricing plan created",
    "First 5 users",
    "First 10 users",
    "University pitch prepared"
  ],
  "🌍 Stability & Organization": [
    "Documents organized",
    "Transfer folder ready",
    "Scholarship folder ready",
    "Business folder ready",
    "Personal development folder ready",
    "8 weeks consistency maintained",
    "Semester finished strong"
  ]
};

export default function App() {
  const [checkedItems, setCheckedItems] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('allOnDeckProgress');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('allOnDeckProgress', JSON.stringify(checkedItems));
    const totalItems = Object.values(checklistData).flat().length;
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    setProgress(Math.round((completedItems / totalItems) * 100));
  }, [checkedItems]);

  const toggleCheck = (category, item) => {
    const key = `${category}-${item}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-12">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-inside: avoid; }
        }
      `}</style>

      <header className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-6 shadow-md rounded-b-2xl">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ALL ONDECK</h1>
            <p className="text-sm opacity-90 mt-1">Semester-End Checklist</p>
          </div>
          <button
            onClick={handleExportPDF}
            className="no-print bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 no-print">
        <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 mt-8 space-y-8">
        {Object.entries(checklistData).map(([category, items]) => (
          <section key={category} className="page-break mb-6">
            <h2 className="text-lg font-bold text-slate-800 border-b-2 border-blue-100 pb-2 mb-4 flex items-center">
              {category}
            </h2>
            <div className="space-y-1">
              {items.map((item) => {
                const isChecked = checkedItems[`${category}-${item}`];
                return (
                  <label
                    key={item}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer touch-manipulation"
                  >
                    <div className="mt-0.5 flex-shrink-0 text-blue-500">
                      {isChecked ? (
                        <CheckCircle2 className="text-emerald-500" size={22} />
                      ) : (
                        <Circle className="text-slate-300" size={22} />
                      )}
                    </div>
                    <span className={`text-base leading-tight ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {item}
                    </span>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked || false}
                      onChange={() => toggleCheck(category, item)}
                    />
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
