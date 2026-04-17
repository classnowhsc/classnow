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
  // ── FREE FRB ──
  {
    id: "frb-free",
    title: "Free FRB Classes for HSC",
    subject: "FRB Free",
    description: "100% free HSC classes from FRB — access all subjects and lectures without any cost.",
    price: 0, originalPrice: 0,
    lectures: 0, duration: "Free",
    icon: "🎓", color: "#facc15", colorDark: "#b45309",
    isFRB: true,
    image: "frb-course.png",
    videos: []
  },

    // ── BANGLA ──
  {
    id: "hsc-bangla-1st",
    title: "HSC Bangla 1st Paper",
    subject: "Bangla 1st",
    description: "HSC Bangla 1st paper — prose, poetry, and literary analysis.",
    price: 199, originalPrice: 399,
    lectures: 5, duration: "20 hrs",
    icon: "🅱", color: "#ff6b35", colorDark: "#cc4400",
    videos: [
      { title: "Bangla 1st Paper – Kobita: যৌবনের গান ও বিদ্রোহী (Lec 1)", videoId: "PSNvv1z1VBg" },
      { title: "Bangla 1st Paper – Golpo: Aat Kudi Bochor Aage (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 1st Paper – Kobita: Sonnet (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 1st Paper – Uponnyas: Lalsalu (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 1st Paper – Natak: Siraj ud Daula (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-bangla-2nd",
    title: "HSC Bangla 2nd Paper",
    subject: "Bangla 2nd",
    description: "HSC Bangla 2nd paper — grammar, composition, and writing skills.",
    price: 199, originalPrice: 399,
    lectures: 5, duration: "20 hrs",
    icon: "🅱", color: "#ff6b35", colorDark: "#cc4400",
    videos: [
      { title: "Bangla 2nd Paper – Vyakoron: Sandhi (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 2nd Paper – Vyakoron: Karak (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 2nd Paper – Rachana: Borsho (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 2nd Paper – Rachana: Probondho (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "Bangla 2nd Paper – Patra Lekha (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },

  // ── ENGLISH ──
  {
    id: "hsc-english-1st",
    title: "HSC English 1st Paper",
    subject: "English 1st",
    description: "HSC English 1st paper — reading, comprehension, and passages.",
    price: 199, originalPrice: 399,
    lectures: 5, duration: "20 hrs",
    icon: "E", color: "#00c6ff", colorDark: "#0072b1",
    videos: [
      { title: "English 1st Paper – Reading Passage (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "English 1st Paper – Summary Writing (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "English 1st Paper – Paragraph (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "English 1st Paper – Composition (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "English 1st Paper – Letter Writing (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-english-2nd",
    title: "HSC English 2nd Paper",
    subject: "English 2nd",
    description: "HSC English 2nd paper — grammar, narration, voice, and modifiers.",
    price: 199, originalPrice: 399,
    lectures: 5, duration: "20 hrs",
    icon: "E", color: "#00c6ff", colorDark: "#0072b1",
    videos: [
      { title: "English 2nd Paper – Articles (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Prepositions (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Narration Change (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Voice Change (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "English 2nd Paper – Modifiers (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },

  // ── ICT ──
  {
    id: "hsc-ict",
    title: "HSC ICT Full Course",
    subject: "ICT",
    description: "Complete ICT syllabus — all 6 chapters with MCQ, CQ, and practical guidance.",
    price: 399, originalPrice: 799,
    lectures: 5, duration: "55 hrs",
    icon: "💻", color: "#7c3aed", colorDark: "#4c1d95",
    videos: [
      { title: "ICT Chapter 1 – Information Technology (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 2 – Communication System (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 3 – Number System (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 4 – Web Design (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "ICT Chapter 5 – Programming C (Lec 5)", videoId: "dQw4w9WgXcQ" }
    ]
  },

  // ── HIGHER MATH ──
  {
    id: "hsc-higher-math-1st",
    title: "HSC Higher Math 1st Paper",
    subject: "Higher Math 1st",
    description: "Higher Math 1st paper — algebra, vectors, trigonometry, and complex numbers.",
    price: 249, originalPrice: 499,
    lectures: 6, duration: "35 hrs",
    icon: "∑", color: "#06b6d4", colorDark: "#0e7490",
    videos: [
      { title: "Higher Math 1st – Matrix & Determinant (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 1st – Vectors (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 1st – Trigonometry (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 1st – Complex Numbers (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 1st – Coordinate Geometry (Lec 5)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 1st – Permutation & Combination (Lec 6)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-higher-math-2nd",
    title: "HSC Higher Math 2nd Paper",
    subject: "Higher Math 2nd",
    description: "Higher Math 2nd paper — calculus, differentiation, integration, and statistics.",
    price: 249, originalPrice: 499,
    lectures: 6, duration: "35 hrs",
    icon: "∑", color: "#06b6d4", colorDark: "#0e7490",
    videos: [
      { title: "Higher Math 2nd – Functions & Limits (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 2nd – Differentiation (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 2nd – Integration (Lec 3)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 2nd – Definite Integral (Lec 4)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 2nd – Differential Equations (Lec 5)", videoId: "dQw4w9WgXcQ" },
      { title: "Higher Math 2nd – Statistics (Lec 6)", videoId: "dQw4w9WgXcQ" }
    ]
  },

  // ── PHYSICS ──
  {
    id: "hsc-physics-1st",
    title: "HSC Physics 1st Paper",
    subject: "Physics 1st",
    description: "Physics 1st paper — vectors, mechanics, gravitation, and waves.",
    price: 249, originalPrice: 499,
    lectures: 3, duration: "30 hrs",
    icon: "⚛", color: "#10b981", colorDark: "#065f46",
    videos: [
      { title: "Physics 1st – Physical World & Measurement (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Physics 1st – Vectors & Dynamics (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Physics 1st – Gravitation & Waves (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-physics-2nd",
    title: "HSC Physics 2nd Paper",
    subject: "Physics 2nd",
    description: "Physics 2nd paper — thermodynamics, electricity, magnetism, and optics.",
    price: 249, originalPrice: 499,
    lectures: 3, duration: "30 hrs",
    icon: "⚛", color: "#10b981", colorDark: "#065f46",
    videos: [
      { title: "Physics 2nd – Thermodynamics (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Physics 2nd – Electricity & Magnetism (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Physics 2nd – Optics & Modern Physics (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  },

  // ── CHEMISTRY ──
  {
    id: "hsc-chemistry-1st",
    title: "HSC Chemistry 1st Paper",
    subject: "Chemistry 1st",
    description: "Chemistry 1st paper — atomic structure, periodic table, and chemical bonding.",
    price: 249, originalPrice: 499,
    lectures: 3, duration: "30 hrs",
    icon: "🧪", color: "#f59e0b", colorDark: "#92400e",
    videos: [
      { title: "Chemistry 1st – Atomic Structure (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Chemistry 1st – Periodic Table (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Chemistry 1st – Chemical Bonding (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-chemistry-2nd",
    title: "HSC Chemistry 2nd Paper",
    subject: "Chemistry 2nd",
    description: "Chemistry 2nd paper — organic chemistry, reactions, and qualitative analysis.",
    price: 249, originalPrice: 499,
    lectures: 3, duration: "30 hrs",
    icon: "🧪", color: "#f59e0b", colorDark: "#92400e",
    videos: [
      { title: "Chemistry 2nd – Organic Chemistry Intro (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Chemistry 2nd – Reactions & Mechanisms (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Chemistry 2nd – Qualitative Analysis (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  },

  // ── BIOLOGY ──
  {
    id: "hsc-biology-1st",
    title: "HSC Biology 1st Paper",
    subject: "Biology 1st",
    description: "Biology 1st paper — cell biology, plant physiology, and genetics.",
    price: 249, originalPrice: 499,
    lectures: 3, duration: "30 hrs",
    icon: "🧬", color: "#ec4899", colorDark: "#9d174d",
    videos: [
      { title: "Biology 1st – Cell & Its Structure (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Biology 1st – Plant Physiology (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Biology 1st – Genetics (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  },
  {
    id: "hsc-biology-2nd",
    title: "HSC Biology 2nd Paper",
    subject: "Biology 2nd",
    description: "Biology 2nd paper — animal physiology, cell division, and biotechnology.",
    price: 249, originalPrice: 499,
    lectures: 3, duration: "30 hrs",
    icon: "🧬", color: "#ec4899", colorDark: "#9d174d",
    videos: [
      { title: "Biology 2nd – Animal Physiology (Lec 1)", videoId: "dQw4w9WgXcQ" },
      { title: "Biology 2nd – Cell Division (Lec 2)", videoId: "dQw4w9WgXcQ" },
      { title: "Biology 2nd – Biotechnology (Lec 3)", videoId: "dQw4w9WgXcQ" }
    ]
  }
];
