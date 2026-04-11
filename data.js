// ============================================================
//  DATA.JS — Edit this file to add/update courses & classes
// ============================================================

const RECENT_CLASSES = [
  {
    id: 1,
    title: "HSC English 2nd Paper – Modifiers (Lec 5)",
    subject: "HSC English",
    lecturer: "Aziz",
    date: "2025-04-08",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    isNew: true
  },
  {
    id: 2,
    title: "HSC Bangla – প্রবন্ধ রচনা (Lec 4)",
    subject: "HSC Bangla",
    lecturer: "Nazmul",
    date: "2025-04-05",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    isNew: true
  },
  {
    id: 3,
    title: "HSC ICT – Chapter 2: Communication System (Lec 3)",
    subject: "HSC ICT",
    lecturer: "Nazmul",
    date: "2025-04-01",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    isNew: false
  },
  {
    id: 4,
    title: "HSC Higher Math – Integration (Lec 1)",
    subject: "HSC Higher Math",
    lecturer: "Nazmul",
    date: "2025-04-10",
    thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    videoId: "dQw4w9WgXcQ",
    isNew: true
  }
];

const COURSES = [
  {
    id: "hsc-bangla",
    title: "HSC Bangla Complete Course",
    subject: "Bangla",
    description: "Full HSC Bangla 1st & 2nd paper preparation — prose, poetry, grammar, and composition.",
    price: 299,
    originalPrice: 599,
    lectures: 30,
    duration: "40 hrs",
    icon: "🅱",
    color: "#ff6b35",
    colorDark: "#cc4400",
    videos: [
      { title: "Bangla 1st Paper – Kobita: Shono Ekti Mujiborer Theke (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 1st Paper – Golpo: Aat Kudi Bochor Aage (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 2nd Paper – Rachana: Borsho (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 2nd Paper – Vyakoron: Sandhi (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 2nd Paper – Rachana: Probondho (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-english",
    title: "HSC English Complete Course",
    subject: "English",
    description: "HSC English 1st & 2nd paper — reading skills, grammar, writing, and passages.",
    price: 349,
    originalPrice: 699,
    lectures: 35,
    duration: "45 hrs",
    icon: "E",
    color: "#00c6ff",
    colorDark: "#0072b1",
    videos: [
      { title: "English 2nd Paper – Articles (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Prepositions (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Narration Change (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Voice Change (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Modifiers (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-ict",
    title: "HSC ICT Full Course",
    subject: "ICT",
    description: "Complete ICT syllabus — all 6 chapters with MCQ, CQ, and practical guidance.",
    price: 399,
    originalPrice: 799,
    lectures: 40,
    duration: "55 hrs",
    icon: "💻",
    color: "#7c3aed",
    colorDark: "#4c1d95",
    videos: [
      { title: "ICT Chapter 1 – Information Technology (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 2 – Communication System (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 3 – Number System (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 4 – Web Design (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 5 – Programming C (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-higher-math",
    title: "HSC Higher Math Full Course",
    subject: "Higher Math",
    description: "Complete Higher Mathematics — algebra, calculus, integration, matrices, vectors and more.",
    price: 449,
    originalPrice: 899,
    lectures: 55,
    duration: "70 hrs",
    icon: "∑",
    color: "#06b6d4",
    colorDark: "#0e7490",
    videos: [
      { title: "Higher Math – Matrix & Determinant (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math – Vectors (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math – Trigonometry (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math – Differentiation (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math – Integration (Lec 5)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math – Complex Numbers (Lec 6)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-physics",
    title: "HSC Physics Full Course",
    subject: "Physics",
    description: "Vectors, mechanics, thermodynamics, waves, electricity — with problem solving.",
    price: 449,
    originalPrice: 899,
    lectures: 50,
    duration: "65 hrs",
    icon: "⚛",
    color: "#10b981",
    colorDark: "#065f46",
    videos: [
      { title: "Physics Chapter 1 – Physical World & Measurement (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Physics Chapter 2 – Vectors (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Physics Chapter 3 – Dynamics (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-chemistry",
    title: "HSC Chemistry Full Course",
    subject: "Chemistry",
    description: "Periodic table, bonding, organic chemistry, and reactions explained clearly.",
    price: 449,
    originalPrice: 899,
    lectures: 45,
    duration: "60 hrs",
    icon: "🧪",
    color: "#f59e0b",
    colorDark: "#92400e",
    videos: [
      { title: "Chemistry Chapter 1 – Atomic Structure (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Chemistry Chapter 2 – Periodic Table (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Chemistry Chapter 3 – Chemical Bonding (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-biology",
    title: "HSC Biology Full Course",
    subject: "Biology",
    description: "Cell biology, genetics, plant & animal physiology — with diagrams and MCQ.",
    price: 399,
    originalPrice: 799,
    lectures: 42,
    duration: "58 hrs",
    icon: "🧬",
    color: "#ec4899",
    colorDark: "#9d174d",
    videos: [
      { title: "Biology Chapter 1 – Cell & Its Structure (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Biology Chapter 2 – Cell Division (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Biology Chapter 3 – Genetics (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  }
];
