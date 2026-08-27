export const DEFAULT_CHECKLIST_DATA = {
  "📘 ESL GPA Improvement": {
    icon: "📘", color: "from-blue-500 to-indigo-600", border: "border-blue-200 dark:border-blue-800", month: 1,
    items: [
      { text: "ESL assignments completed", week: 1 }, { text: "Attend class consistently", week: 1 },
      { text: "Reading exercise", week: 2 }, { text: "Writing practice", week: 2 },
      { text: "Learn 5 new vocabulary words", week: 3 }, { text: "Rewrite graded work for clarity", week: 3 },
      { text: "GPA milestone: 1.7 → 2.3", week: 4 }, { text: "GPA milestone: 2.3 → 2.8", week: 6 },
      { text: "GPA milestone: 2.8 → 3.0+", week: 10 },
    ]
  },
  "🎓 Transfer Positioning": {
    icon: "🎓", color: "from-emerald-500 to-teal-600", border: "border-emerald-200 dark:border-emerald-800", month: 1,
    items: [
      { text: "CV updated", week: 1 }, { text: "Scholarship résumé updated", week: 1 },
      { text: "Transcripts organized", week: 2 }, { text: "Certifications organized", week: 2 },
      { text: "Transfer timeline created", week: 3 }, { text: "Email HCU admissions", week: 4 },
      { text: "Email HCU tennis coach", week: 4 }, { text: "Email DBU admissions", week: 5 },
      { text: "Email TWU admissions", week: 5 }, { text: "Visit HCU campus", week: 6 },
      { text: "Follow-up sent", week: 7 }, { text: "Scholarship package prepared", week: 8 },
    ]
  },
  "🚗 Driving License": {
    icon: "🚗", color: "from-orange-500 to-red-500", border: "border-orange-200 dark:border-orange-800", month: 2,
    items: [
      { text: "Choose driving school", week: 5 }, { text: "Schedule driving test", week: 6 },
      { text: "Take the test", week: 7 }, { text: "Pass the test", week: 7 },
      { text: "Get certificate", week: 8 }, { text: "Go to DPS", week: 9 },
      { text: "Receive license", week: 10 },
    ]
  },
  "🧠 Emotional Regulation": {
    icon: "🧠", color: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800", month: 1,
    items: [
      { text: "Daily reflection", week: 1 }, { text: "Maintain sleep routine", week: 1 },
      { text: "Weekly reset", week: 2 }, { text: "Gym/fitness session", week: 2 },
      { text: "Reduce stress triggers", week: 4 },
    ]
  },
  "💼 Business Progress": {
    icon: "💼", color: "from-amber-500 to-orange-500", border: "border-amber-200 dark:border-amber-800", month: 2,
    items: [
      { text: "Choose ONE main project", week: 5 }, { text: "SleekTechSport weekly review", week: 5 },
      { text: "Feature 1 completed", week: 6 }, { text: "Feature 2 completed", week: 7 }, { text: "Allondeck Hub launched", week: 7 },
      { text: "Feature 3 completed", week: 8 }, { text: "Debugger MVP ready", week: 8 },
      { text: "Test webhook logs", week: 9 }, { text: "Landing page created", week: 9 },
      { text: "Pricing plan created", week: 10 }, { text: "First 5 users", week: 10 },
      { text: "First 10 users", week: 11 }, { text: "University pitch prepared", week: 12 },
    ]
  },
  "🌍 Stability & Organization": {
    icon: "🌍", color: "from-cyan-500 to-blue-500", border: "border-cyan-200 dark:border-cyan-800", month: 3,
    items: [
      { text: "Documents organized", week: 9 }, { text: "Transfer folder ready", week: 9 },
      { text: "Scholarship folder ready", week: 10 }, { text: "Business folder ready", week: 10 },
      { text: "Personal development folder ready", week: 11 }, { text: "8 weeks consistency maintained", week: 11 },
      { text: "Semester finished strong", week: 12 },
    ]
  }
};

export const COLOR_OPTIONS = [
  { value: 'from-blue-500 to-indigo-600', border: 'border-blue-200 dark:border-blue-800', label: 'Blue' },
  { value: 'from-emerald-500 to-teal-600', border: 'border-emerald-200 dark:border-emerald-800', label: 'Green' },
  { value: 'from-orange-500 to-red-500', border: 'border-orange-200 dark:border-orange-800', label: 'Orange' },
  { value: 'from-purple-500 to-pink-500', border: 'border-purple-200 dark:border-purple-800', label: 'Purple' },
  { value: 'from-amber-500 to-orange-500', border: 'border-amber-200 dark:border-amber-800', label: 'Amber' },
  { value: 'from-cyan-500 to-blue-500', border: 'border-cyan-200 dark:border-cyan-800', label: 'Cyan' },
  { value: 'from-rose-500 to-pink-600', border: 'border-rose-200 dark:border-rose-800', label: 'Rose' },
  { value: 'from-lime-500 to-green-500', border: 'border-lime-200 dark:border-lime-800', label: 'Lime' },
];

export const ICON_OPTIONS = ['📘','🎓','🚗','🧠','💼','🌍','💪','📚','🎯','🚀','💰','❤️','⭐','🔥','🎵','🎨','📱','💻','🏆','✈️','🏠','📊'];

export const quotes = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Your only limit is your mind.",
  "Progress, not perfection.",
  "Every accomplishment starts with the decision to try.",
  "Discipline is choosing between what you want now and what you want most.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't watch the clock; do what it does. Keep going.",
  "Success is the sum of small efforts repeated daily.",
  "Believe you can and you're halfway there."
];

export const milestones = [
  { percent: 25 }, { percent: 50 }, { percent: 75 }, { percent: 100 }
];

export const monthLabels = {
  1: { label: 'month1', sublabel: 'month1sub', color: 'from-blue-500 to-indigo-500' },
  2: { label: 'month2', sublabel: 'month2sub', color: 'from-emerald-500 to-teal-500' },
  3: { label: 'month3', sublabel: 'month3sub', color: 'from-amber-500 to-orange-500' },
};

export const urgencyStyles = {
  done: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' },
  overdue: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
  'this-week': { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' },
  'next-week': { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  'on-track': { bg: 'bg-slate-50 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700', badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
};

// Resume AudioContext on first user interaction (required for mobile)
let audioCtx = null;
const resumeAudio = () => {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};
if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'keydown'].forEach((evt) => {
    window.addEventListener(evt, resumeAudio, { once: false, passive: true });
  });
}

export const playCompleteSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
};

export const BUILTIN_TEMPLATES = [
  {
    name: "My Semester Plan",
    description: "Your current semester plan with academic, transfer, driving, emotional, business, and organization goals.",
    icon: "🎓",
    data: { ...DEFAULT_CHECKLIST_DATA }
  },
  {
    name: "Student Success",
    description: "A comprehensive academic plan focused on GPA improvement, study habits, and exam preparation.",
    icon: "📚",
    data: {
      "📘 GPA Target": {
        icon: "📘", color: "from-blue-500 to-indigo-600", border: "border-blue-200 dark:border-blue-800", month: 1,
        items: [
          { text: "Set semester GPA target", week: 1 }, { text: "Create study schedule", week: 1 },
          { text: "Attend all lectures for 2 weeks straight", week: 2 }, { text: "Complete all homework on time", week: 2 },
          { text: "Visit professor office hours", week: 3 }, { text: "Form or join study group", week: 3 },
          { text: "Midterm prep completed", week: 5 }, { text: "GPA check-in: on track?", week: 6 },
          { text: "Final exam study plan ready", week: 10 }, { text: "Achieve target GPA", week: 12 },
        ]
      },
      "📝 Study Skills": {
        icon: "📝", color: "from-emerald-500 to-teal-600", border: "border-emerald-200 dark:border-emerald-800", month: 1,
        items: [
          { text: "Learn Pomodoro technique", week: 1 }, { text: "Set up note-taking system", week: 1 },
          { text: "Practice active recall weekly", week: 2 }, { text: "Try spaced repetition", week: 3 },
          { text: "Reduce phone time during study", week: 4 }, { text: "Weekly review of notes", week: 4 },
          { text: "Summarize each chapter after reading", week: 6 }, { text: "Teach a concept to someone", week: 8 },
        ]
      },
      "🗓️ Time Management": {
        icon: "🗓️", color: "from-amber-500 to-orange-500", border: "border-amber-200 dark:border-amber-800", month: 1,
        items: [
          { text: "Create weekly planner", week: 1 }, { text: "Block study hours daily", week: 1 },
          { text: "Prioritize tasks using Eisenhower matrix", week: 2 }, { text: "Set 3 daily goals each morning", week: 3 },
          { text: "No procrastination for 1 week", week: 5 }, { text: "Review and adjust schedule", week: 6 },
          { text: "Maintain schedule for 4 weeks", week: 10 }, { text: "End-of-semester reflection", week: 12 },
        ]
      },
      "🎯 Exam Preparation": {
        icon: "🎯", color: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800", month: 2,
        items: [
          { text: "Gather past exams", week: 5 }, { text: "Create exam study timetable", week: 6 },
          { text: "Complete practice tests", week: 7 }, { text: "Review weak areas", week: 8 },
          { text: "Study group review session", week: 9 }, { text: "Final revision completed", week: 11 },
        ]
      },
      "💪 Wellness": {
        icon: "💪", color: "from-cyan-500 to-blue-500", border: "border-cyan-200 dark:border-cyan-800", month: 1,
        items: [
          { text: "Sleep 7+ hours for 5 days", week: 1 }, { text: "Exercise 3 times this week", week: 1 },
          { text: "Drink 8 glasses of water daily", week: 2 }, { text: "Take a break day", week: 3 },
          { text: "Mindfulness practice", week: 4 }, { text: "Maintain routine for 3 weeks", week: 6 },
        ]
      }
    }
  },
  {
    name: "Business Launch",
    description: "A 12-week startup launch plan from idea validation to first users.",
    icon: "🚀",
    data: {
      "💡 Idea Validation": {
        icon: "💡", color: "from-amber-500 to-orange-500", border: "border-amber-200 dark:border-amber-800", month: 1,
        items: [
          { text: "Write down 3 business ideas", week: 1 }, { text: "Research market size for top idea", week: 1 },
          { text: "Interview 5 potential customers", week: 2 }, { text: "Analyze competitors", week: 2 },
          { text: "Validate problem-solution fit", week: 3 }, { text: "Define unique value proposition", week: 3 },
          { text: "Create one-page business plan", week: 4 }, { text: "Choose final idea to pursue", week: 4 },
        ]
      },
      "🛠️ MVP Build": {
        icon: "🛠️", color: "from-blue-500 to-indigo-600", border: "border-blue-200 dark:border-blue-800", month: 2,
        items: [
          { text: "Define MVP feature list", week: 5 }, { text: "Set up development environment", week: 5 },
          { text: "Build core feature 1", week: 6 }, { text: "Build core feature 2", week: 7 },
          { text: "Internal testing", week: 8 }, { text: "Fix critical bugs", week: 8 },
          { text: "Beta test with 3 users", week: 9 }, { text: "Iterate based on feedback", week: 9 },
        ]
      },
      "📢 Launch Prep": {
        icon: "📢", color: "from-emerald-500 to-teal-600", border: "border-emerald-200 dark:border-emerald-800", month: 3,
        items: [
          { text: "Create landing page", week: 9 }, { text: "Set up social media accounts", week: 9 },
          { text: "Write launch announcement", week: 10 }, { text: "Set pricing", week: 10 },
          { text: "Prepare support docs", week: 11 }, { text: "Soft launch to friends & family", week: 11 },
          { text: "Official launch day", week: 12 }, { text: "Collect first 5 users' feedback", week: 12 },
        ]
      },
      "📊 Growth": {
        icon: "📊", color: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800", month: 3,
        items: [
          { text: "Set up analytics", week: 10 }, { text: "Define key metrics to track", week: 10 },
          { text: "First growth experiment", week: 11 }, { text: "Review metrics weekly", week: 11 },
          { text: "Acquire 10 users", week: 12 }, { text: "Document lessons learned", week: 12 },
        ]
      }
    }
  },
  {
    name: "Career & Job Search",
    description: "A structured plan for landing your dream job — from resume to interview.",
    icon: "💼",
    data: {
      "📄 Resume & LinkedIn": {
        icon: "📄", color: "from-blue-500 to-indigo-600", border: "border-blue-200 dark:border-blue-800", month: 1,
        items: [
          { text: "Update resume with latest experience", week: 1 }, { text: "Get resume reviewed by a peer", week: 1 },
          { text: "Optimize LinkedIn headline & summary", week: 2 }, { text: "Add 5 skills to LinkedIn", week: 2 },
          { text: "Request 3 LinkedIn recommendations", week: 3 }, { text: "Create portfolio or personal site", week: 4 },
          { text: "Finalize resume version", week: 4 },
        ]
      },
      "🔍 Job Applications": {
        icon: "🔍", color: "from-emerald-500 to-teal-600", border: "border-emerald-200 dark:border-emerald-800", month: 1,
        items: [
          { text: "Research target companies", week: 1 }, { text: "Create a job tracking spreadsheet", week: 1 },
          { text: "Apply to 5 jobs this week", week: 2 }, { text: "Apply to 5 more jobs", week: 3 },
          { text: "Apply to 10 jobs total", week: 4 }, { text: "Follow up on applications", week: 5 },
          { text: "Apply to 20 jobs total", week: 8 }, { text: "Apply to 30 jobs total", week: 12 },
        ]
      },
      "🤝 Networking": {
        icon: "🤝", color: "from-amber-500 to-orange-500", border: "border-amber-200 dark:border-amber-800", month: 1,
        items: [
          { text: "Attend 1 networking event", week: 2 }, { text: "Connect with 5 professionals on LinkedIn", week: 2 },
          { text: "Reach out to 3 alumni", week: 3 }, { text: "Informational interview with 1 person", week: 4 },
          { text: "Attend career fair", week: 6 }, { text: "Follow up with all contacts", week: 8 },
        ]
      },
      "🎤 Interview Prep": {
        icon: "🎤", color: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800", month: 2,
        items: [
          { text: "Research common interview questions", week: 5 }, { text: "Prepare STAR method answers", week: 6 },
          { text: "Do 3 mock interviews", week: 7 }, { text: "Research company culture", week: 8 },
          { text: "Prepare questions to ask interviewer", week: 9 }, { text: "Practice salary negotiation", week: 10 },
          { text: "Final interview prep checklist", week: 11 },
        ]
      }
    }
  },
  {
    name: "Fitness Goals",
    description: "A 12-week fitness transformation plan — build strength, endurance, and healthy habits.",
    icon: "💪",
    data: {
      "🏃 Cardio Endurance": {
        icon: "🏃", color: "from-emerald-500 to-teal-600", border: "border-emerald-200 dark:border-emerald-800", month: 1,
        items: [
          { text: "Walk 30 min daily for 1 week", week: 1 }, { text: "Jog 1 mile without stopping", week: 2 },
          { text: "Run 2 miles", week: 3 }, { text: "Run 3 miles", week: 5 },
          { text: "Complete a 5K run", week: 7 }, { text: "Run 4 miles", week: 9 },
          { text: "Run a 10K or equivalent", week: 12 },
        ]
      },
      "🏋️ Strength Training": {
        icon: "🏋️", color: "from-blue-500 to-indigo-600", border: "border-blue-200 dark:border-blue-800", month: 1,
        items: [
          { text: "Learn basic compound lifts", week: 1 }, { text: "Workout 2x this week", week: 1 },
          { text: "Workout 3x this week", week: 2 }, { text: "Increase weight on main lifts", week: 3 },
          { text: "Complete 4 workouts in a week", week: 5 }, { text: "Hit a personal best on a lift", week: 7 },
          { text: "Maintain 4x/week for 3 weeks", week: 10 }, { text: "New personal best", week: 12 },
        ]
      },
      "🥗 Nutrition": {
        icon: "🥗", color: "from-orange-500 to-red-500", border: "border-orange-200 dark:border-orange-800", month: 1,
        items: [
          { text: "Track calories for 3 days", week: 1 }, { text: "Meal prep for 1 week", week: 2 },
          { text: "Eat 5 servings of vegetables daily", week: 3 }, { text: "Reduce sugar intake", week: 4 },
          { text: "Follow meal plan for 2 weeks", week: 6 }, { text: "Try 3 new healthy recipes", week: 8 },
          { text: "Maintain nutrition plan for 4 weeks", week: 12 },
        ]
      },
      "🧘 Recovery & Flexibility": {
        icon: "🧘", color: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800", month: 1,
        items: [
          { text: "Stretch 10 min daily", week: 1 }, { text: "Try a yoga session", week: 2 },
          { text: "Foam roll after workouts", week: 3 }, { text: "Get 7+ hours sleep for 5 nights", week: 4 },
          { text: "Practice yoga 2x/week", week: 6 }, { text: "Touch your toes (flexibility goal)", week: 8 },
          { text: "Full recovery routine established", week: 12 },
        ]
      }
    }
  },
  {
    name: "Personal Growth",
    description: "Build confidence, mindfulness, and life skills over 12 weeks.",
    icon: "🌟",
    data: {
      "🧘 Mindfulness": {
        icon: "🧘", color: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800", month: 1,
        items: [
          { text: "Meditate 5 min daily for 1 week", week: 1 }, { text: "Journal every evening for 5 days", week: 1 },
          { text: "Try guided meditation app", week: 2 }, { text: "Practice gratitude journaling", week: 3 },
          { text: "Meditate 10 min daily", week: 5 }, { text: "Complete 30-day meditation streak", week: 9 },
          { text: "Attend a meditation workshop", week: 11 },
        ]
      },
      "📚 Reading & Learning": {
        icon: "📚", color: "from-blue-500 to-indigo-600", border: "border-blue-200 dark:border-blue-800", month: 1,
        items: [
          { text: "Choose a book to read", week: 1 }, { text: "Read 20 pages daily", week: 1 },
          { text: "Finish first book", week: 3 }, { text: "Start second book", week: 4 },
          { text: "Listen to 2 educational podcasts", week: 5 }, { text: "Finish second book", week: 7 },
          { text: "Write a book summary", week: 8 }, { text: "Read 4 books total", week: 12 },
        ]
      },
      "🗣️ Communication": {
        icon: "🗣️", color: "from-emerald-500 to-teal-600", border: "border-emerald-200 dark:border-emerald-800", month: 2,
        items: [
          { text: "Start a conversation with a stranger", week: 5 }, { text: "Give a short presentation", week: 6 },
          { text: "Practice active listening for 1 week", week: 7 }, { text: "Write a letter to someone", week: 8 },
          { text: "Join a public speaking group", week: 9 }, { text: "Lead a group discussion", week: 11 },
        ]
      },
      "🎯 Habits & Discipline": {
        icon: "🎯", color: "from-amber-500 to-orange-500", border: "border-amber-200 dark:border-amber-800", month: 1,
        items: [
          { text: "Set 3 morning habits", week: 1 }, { text: "Wake up early for 5 days", week: 2 },
          { text: "No social media before noon for 1 week", week: 3 }, { text: "Create evening routine", week: 4 },
          { text: "Maintain all habits for 2 weeks", week: 6 }, { text: "30-day habit streak", week: 10 },
          { text: "Reflect on personal growth", week: 12 },
        ]
      }
    }
  },
  {
    name: "Learning a Skill",
    description: "Structured 12-week plan to learn any new skill — coding, design, language, instrument, and more.",
    icon: "🎓",
    data: {
      "📋 Foundations": {
        icon: "📋", color: "from-blue-500 to-indigo-600", border: "border-blue-200 dark:border-blue-800", month: 1,
        items: [
          { text: "Choose the skill to learn", week: 1 }, { text: "Find learning resources (course, book, mentor)", week: 1 },
          { text: "Set up practice environment", week: 1 }, { text: "Complete first lesson", week: 2 },
          { text: "Understand core fundamentals", week: 3 }, { text: "Build first simple project/exercise", week: 4 },
          { text: "Review and solidify basics", week: 4 },
        ]
      },
      "🔧 Practice & Projects": {
        icon: "🔧", color: "from-emerald-500 to-teal-600", border: "border-emerald-200 dark:border-emerald-800", month: 2,
        items: [
          { text: "Practice 30 min daily", week: 5 }, { text: "Complete intermediate tutorial", week: 6 },
          { text: "Build project #1", week: 7 }, { text: "Get feedback on project", week: 8 },
          { text: "Build project #2 (more complex)", week: 9 }, { text: "Study advanced concepts", week: 10 },
        ]
      },
      "🌟 Mastery": {
        icon: "🌟", color: "from-amber-500 to-orange-500", border: "border-amber-200 dark:border-amber-800", month: 3,
        items: [
          { text: "Build capstone project", week: 10 }, { text: "Share work with community", week: 11 },
          { text: "Get peer review", week: 11 }, { text: "Refine and polish project", week: 12 },
          { text: "Document what you learned", week: 12 }, { text: "Set goals for continued learning", week: 12 },
        ]
      },
      "🤝 Accountability": {
        icon: "🤝", color: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800", month: 1,
        items: [
          { text: "Find a learning buddy", week: 1 }, { text: "Share your goal publicly", week: 2 },
          { text: "Weekly progress check-in", week: 3 }, { text: "Teach someone what you learned", week: 5 },
          { text: "Join a community of learners", week: 7 }, { text: "Present your final project", week: 12 },
        ]
      }
    }
  }
];

export const FREE_LIMITS = { maxGoals: 1, maxMilestonesPerGoal: 6, maxTasksPerMilestone: 10 };

export const ACHIEVEMENTS_DEF = [
  { id: 'first_goal', name: 'First Goal Created', icon: '🎯', description: 'Create your first goal' },
  { id: 'first_task', name: 'First Step', icon: '👣', description: 'Complete your first task' },
  { id: 'ten_tasks', name: 'Getting Started', icon: '🔟', description: 'Complete 10 tasks' },
  { id: 'first_milestone', name: 'Milestone Master', icon: '🏆', description: 'Complete an entire milestone' },
  { id: 'first_goal_done', name: 'Goal Crusher', icon: '💎', description: 'Complete an entire goal' },
  { id: 'seven_day_streak', name: '7-Day Warrior', icon: '🔥', description: 'Maintain a 7-day streak' },
  { id: 'first_week', name: 'Week One', icon: '📅', description: 'Complete your first week' },
  { id: 'fifty_tasks', name: 'Half Century', icon: '⚡', description: 'Complete 50 tasks' },
];

export const GOAL_CATEGORIES = [
  { id: 'education', label: 'Education', icon: '📚', color: 'from-blue-500 to-indigo-600' },
  { id: 'business', label: 'Business', icon: '💼', color: 'from-amber-500 to-orange-500' },
  { id: 'health', label: 'Health & Fitness', icon: '💪', color: 'from-emerald-500 to-teal-500' },
  { id: 'career', label: 'Career', icon: '🚀', color: 'from-purple-500 to-pink-500' },
  { id: 'personal', label: 'Personal Growth', icon: '🌟', color: 'from-cyan-500 to-blue-500' },
  { id: 'skills', label: 'Skills', icon: '🎓', color: 'from-rose-500 to-pink-600' },
  { id: 'other', label: 'Other', icon: '📌', color: 'from-slate-500 to-slate-600' },
];
