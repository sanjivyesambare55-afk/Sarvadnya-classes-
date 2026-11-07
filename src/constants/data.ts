import { ProgramInfo } from '../types';

export const BUSINESS_INFO = {
  name: 'Sarvadnya Tuition Classes',
  tagline: 'Learn Smart. Score Higher.',
  address: '01 Sarvashree Nagar, Nagpur, Maharashtra, India',
  phone: '7020035514',
  phoneFormatted: '+91 70200 35514',
  whatsappNumber: '917020035514',
  libraryTimings: '7:00 AM – 10:00 PM',
  city: 'Nagpur',
  state: 'Maharashtra',
  mapsUrl: 'https://maps.google.com/?q=01+Sarvashree+Nagar,+Nagpur,+Maharashtra,+India',
  whatsappBaseUrl: 'https://wa.me/917020035514',
};

export const PROGRAMS: ProgramInfo[] = [
  {
    id: 'class-9',
    title: 'Class 9',
    subtitle: 'Building Fundamental Academic Depth',
    badge: 'Foundation',
    category: 'foundation',
    description: 'Develop a strong understanding of essential school concepts and build productive learning habits that set the baseline for high school mastery.',
    focusAreas: [
      'Core Mathematics & Analytical Reasoning',
      'Fundamental Physics, Chemistry & Biology',
      'Structured Homework & Daily Problem Sets',
      'Early Habit Building & Concept Consolidation'
    ],
    schedule: 'Regular batches with focused attention',
    highlights: ['Concept clarity over rote memorization', 'Continuous chapter-wise assessment', 'Dedicated doubt solving sessions']
  },
  {
    id: 'class-10',
    title: 'Class 10',
    subtitle: 'Systematic Board Exam Preparation',
    badge: 'Board Excellence',
    category: 'foundation',
    description: 'Strengthen subject knowledge, practice problem-solving, and prepare systematically for board examinations with clarity and confidence.',
    focusAreas: [
      'Complete Board Syllabus Coverage',
      'Step-by-Step Numerical & Theory Solutions',
      'Timed Exam Simulation & Answer Writing Formats',
      'Previous Years Papers & Question Analysis'
    ],
    schedule: 'Comprehensive academic year modules',
    highlights: ['Rigorous revision cycles', 'Standardized answer key practice', 'Personalized weakness remediation']
  },
  {
    id: 'class-11',
    title: 'Class 11',
    subtitle: 'Senior Secondary Conceptual Transition',
    badge: 'Senior Secondary',
    category: 'senior',
    description: 'Build a strong conceptual foundation for advanced academic study. Bridge the vital gap between secondary and senior secondary disciplines.',
    focusAreas: [
      'Advanced Mechanics, Thermodynamics & Vectors',
      'Organic & Inorganic Fundamentals, Stoichiometry',
      'Calculus, Trigonometry & Coordinate Geometry',
      'Deep conceptual rigor for future competitive tracks'
    ],
    schedule: 'In-depth theory and rigorous practice tracks',
    highlights: ['High-level problem solving', 'Foundation alignment with entrance syllabi', 'Regular concept check-ins']
  },
  {
    id: 'class-12',
    title: 'Class 12',
    subtitle: 'Mastery & Board Milestone Preparation',
    badge: 'Milestone Year',
    category: 'senior',
    description: 'Strengthen subject understanding and prepare for your next academic step with synchronized board exam discipline and competitive aptitude.',
    focusAreas: [
      'Electromagnetism, Optics & Modern Physics',
      'Physical, Organic Reactions & Coordination Chemistry',
      'Differential & Integral Calculus, Vectors & 3D',
      'High-yield board revisions & mock test routines'
    ],
    schedule: 'Intensive curriculum & full syllabus tests',
    highlights: ['Board + competitive synchronization', 'Error log analysis', 'Targeted subject reinforcement']
  },
  {
    id: 'neet',
    title: 'NEET Preparation',
    subtitle: 'Medical Entrance Foundation & Rigor',
    badge: 'Medical Track',
    category: 'competitive',
    description: 'Explore NEET preparation at Sarvadnya Tuition Classes with structured focus on conceptual understanding, academic preparation, and systematic revision.',
    focusAreas: [
      'NCERT Line-by-Line Mastery across Physics, Chemistry & Biology',
      'Speed & Accuracy Drilling for Medical Entrance MCQ Formats',
      'High-Yield Diagram, Reaction & Taxonomy Mapping',
      'Negative Marking Reduction Strategies'
    ],
    schedule: 'Targeted competitive cohorts',
    highlights: ['Conceptual precision in Physics numericals', 'Chemistry reaction mechanism drills', 'Biology mnemonic & revision cycles']
  },
  {
    id: 'jee',
    title: 'JEE Preparation',
    subtitle: 'Engineering Entrance & Problem-Solving Capability',
    badge: 'Engineering Track',
    category: 'competitive',
    description: 'Explore JEE preparation with a focus on understanding concepts, developing analytical thinking, and approaching challenging multi-concept problems.',
    focusAreas: [
      'Deep Analytical Mechanics & Advanced Calculus Applications',
      'Physical Chemistry Numerical Methods & Organic Synthesis',
      'Multi-Concept Problem Deconstruction',
      'Time Management & Strategic Question Selection'
    ],
    schedule: 'Rigorous engineering entrance modules',
    highlights: ['Concept synthesis across multiple chapters', 'Advanced level problem worksheets', 'Timed simulation tests']
  }
];

export const LIBRARY_FEATURE = {
  title: 'Your Space to Focus',
  subtitle: 'A dedicated place to sit, study and concentrate.',
  hours: '7:00 AM to 10:00 PM',
  address: '01 Sarvashree Nagar, Nagpur',
  description: 'Quiet, disturbance-free study seating designed for serious students preparing for school exams, boards, NEET, and JEE. Equipped with individual study carrels, comfortable seating, and an atmosphere built for prolonged academic concentration.',
  features: [
    'Individual desk carrels with privacy dividers',
    'Ample natural daylight and warm focused desk lighting',
    'Quiet acoustic discipline for uninterrupted focus',
    'Open daily 7:00 AM through 10:00 PM (15 continuous hours)',
    'Convenient location at Sarvashree Nagar, Nagpur'
  ]
};

export const WHY_US_BLOCKS = [
  {
    number: '01',
    title: 'Classes 9 & 10 Foundations',
    subtitle: 'Solid Roots',
    description: 'We prioritize core concepts and study discipline before exam pressure begins. Students build logical confidence that lasts throughout high school.'
  },
  {
    number: '02',
    title: 'Classes 11 & 12 Senior Secondary',
    subtitle: 'Conceptual Mastery',
    description: 'The jump in senior secondary rigor is met with patient explanation, systematic derivation, and rigorous numerical practice.'
  },
  {
    number: '03',
    title: 'NEET & JEE Focused Cohorts',
    subtitle: 'Analytical Rigor',
    description: 'Disciplined practice schedules, NCERT deconstruction, and structured doubt resolution to transform ambition into real capability.'
  },
  {
    number: '04',
    title: 'Dedicated Study Library',
    subtitle: '7:00 AM – 10:00 PM',
    description: 'A tranquil, well-lit study environment where students can stay disciplined and complete assignments away from home distractions.'
  }
];

export const FACULTY_MEMBERS = [
  {
    name: "Dr. Rajesh Sharma",
    role: "Physics & Senior Academic Head",
    qualification: "Ph.D. Physics, VNIT Nagpur",
    experience: "15+ Years Experience"
  },
  {
    name: "Prof. Sneha Deshmukh",
    role: "Mathematics Lead (JEE / Senior)",
    qualification: "M.Sc. Mathematics, IIT Bombay",
    experience: "12+ Years Experience"
  },
  {
    name: "Dr. Amit Kulkarni",
    role: "Chemistry Specialist",
    qualification: "M.Tech & Ph.D. Chemistry",
    experience: "10+ Years Experience"
  },
  {
    name: "Prof. Priya Patil",
    role: "Biology & NEET Expert",
    qualification: "M.Sc. Life Sciences",
    experience: "8+ Years Experience"
  }
];

export const TOPPERS_OF_THE_MONTH = [
  { class: "Class 9", students: ["Aarav Joshi", "Ananya Verma", "Rohan Kale", "Diya Gawande", "Tanmay Shinde"] },
  { class: "Class 10", students: ["Vedant Thakre", "Shruti Deshmukh", "Yash Raut", "Kunal Meshram", "Neha Ingle"] },
  { class: "Class 11", students: ["Aditya Wankhade", "Pratiksha Patil", "Sahil Sheikh", "Tanvi Barde", "Harshwardhan Kale"] },
  { class: "Class 12", students: ["Siddharth More", "Kalyani Kale", "Omkar Joshi", "Snehal Raut", "Rutuja Tawari"] },
  { class: "NEET Batch", students: ["Pooja Nandanwar", "Akash Shrivastava", "Megha Deshmukh", "Saurabh Tiwari", "Riya Patil"] },
  { class: "JEE Batch", students: ["Karan Mehra", "Nikhil Khandelwal", "Tanmay Joshi", "Ayush Agrawal", "Rohan Pande"] }
];

export const GALLERY_IMAGES = [
  { title: "Main Classroom Lecture Session", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80" },
  { title: "Student Library & Study Carrels", url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80" },
  { title: "Physics & Chemistry Practical Lab", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80" },
  { title: "Doubt Solving & Interactive Session", url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80" }
];

export const SUCCESS_METRICS = [
  {
    value: 100,
    suffix: "+",
    label: "Board Distinctions",
    description: "Students securing 85%+ in Class 10 & 12 Board Examinations",
    category: "Academic Excellence"
  },
  {
    value: 50,
    suffix: "+",
    label: "Medical Admissions",
    description: "NEET qualifiers securing seats in government and premier medical colleges",
    category: "NEET Medical Track"
  },
  {
    value: 45,
    suffix: "+",
    label: "Engineering Selections",
    description: "JEE Mains & Advanced qualifiers entering top engineering institutions",
    category: "JEE Engineering Track"
  },
  {
    value: 15,
    suffix: " hrs",
    label: "Daily Library Seating",
    description: "7:00 AM to 10:00 PM uninterrupted quiet study environment in Nagpur",
    category: "Study Sanctuary"
  }
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Vedant Thakre',
    program: 'Class 10 Board Excellence',
    scoreOrAchievement: '96.4% in 10th Boards',
    year: 'Class of 2024-25',
    rating: 5,
    review: 'The teachers at Sarvadnya transformed my approach to Mathematics and Science. Instead of rote memorization, they focused deeply on derivation and fundamental concept clarity. The regular chapter-wise test series and individual feedback made all the difference.'
  },
  {
    id: 't-2',
    name: 'Pooja Nandanwar',
    program: 'NEET Medical Batch',
    scoreOrAchievement: '658/720 in NEET',
    year: 'Class of 2024-25',
    rating: 5,
    review: 'Biology diagrams, organic chemistry reaction pathways, and physics numericals were broken down with immense patience. Having access to the quiet student library from 7 AM to 10 PM gave me the disciplined sanctuary I needed to study 12 hours a day without distractions.'
  },
  {
    id: 't-3',
    name: 'Karan Mehra',
    program: 'JEE Engineering Cohort',
    scoreOrAchievement: '99.2 Percentile (JEE Main)',
    year: 'Class of 2024-25',
    rating: 5,
    review: 'Dr. Rajesh Sharma sir and Prof. Sneha Deshmukh ma\'am gave me the analytical confidence to tackle multi-concept problems that used to intimidate me. The doubt-solving sessions were always accessible and thorough.'
  },
  {
    id: 't-4',
    name: 'Shruti Deshmukh',
    program: 'Class 12 Senior Secondary & MHT-CET',
    scoreOrAchievement: '95.8% HSC Boards',
    year: 'Class of 2024-25',
    rating: 5,
    review: 'Balancing board examinations with competitive entrances is stressful, but Sarvadnya structured our timeline perfectly. The teachers ensured our conceptual foundation was rock solid before entering full-length mock exams.'
  },
  {
    id: 't-5',
    name: 'Aditya Wankhade',
    program: 'Dedicated Student Library Member',
    scoreOrAchievement: '15 hrs Daily Concentration',
    year: 'Active Member',
    rating: 5,
    review: 'The student study library at Sarvashree Nagar is genuinely the best study environment in Nagpur. The individual carrels, quiet acoustic discipline, and comfortable seating allowed me to sustain high-focus study sessions consistently every day.'
  },
  {
    id: 't-6',
    name: 'Ananya Verma',
    program: 'Class 9 Foundation Track',
    scoreOrAchievement: 'Top Ranker in Science',
    year: 'Class of 2025-26',
    rating: 5,
    review: 'Joining the foundation batch early in Class 9 helped me remove my fear of physics numericals. The small batch size means teachers notice whenever someone hesitates and explain the problem again until everyone understands.'
  }
];

export const FAQ_ITEMS = [
  {
    id: 'faq-batch-size',
    category: 'batches',
    categoryLabel: 'Batch Sizes & Attention',
    question: 'What are the batch sizes, and how is personal attention ensured?',
    answer: 'We maintain strict batch caps of 20 to 25 students per classroom cohort. Unlike crowded mass coaching centers, our limited batch size guarantees that every student sits close to the instructor, receives regular homework evaluations, and feels comfortable asking questions immediately during lectures.'
  },
  {
    id: 'faq-timings',
    category: 'timings',
    categoryLabel: 'Timings & Schedules',
    question: 'What are the daily batch timings and class schedules?',
    answer: 'Classroom sessions are scheduled in flexible morning (6:30 AM – 9:30 AM) and evening (4:30 PM – 8:30 PM) slots designed around school and junior college hours. In addition, our dedicated student study library is open continuously for 15 hours daily from 7:00 AM to 10:00 PM, giving students a quiet sanctuary to study before or after classes.'
  },
  {
    id: 'faq-syllabus-coverage',
    category: 'syllabus',
    categoryLabel: 'Syllabus & Tests',
    question: 'How is syllabus completion and board exam revision managed?',
    answer: 'For Classes 10 & 12, the full academic syllabus is completed comprehensively by early November. This leaves 3 to 4 months for structured revision cycles: chapter-wise question banks, previous 10-year board paper deconstruction, and full-length timed board mock exams with step-by-step marking according to board evaluation rubrics.'
  },
  {
    id: 'faq-neet-jee-balance',
    category: 'syllabus',
    categoryLabel: 'Syllabus & Tests',
    question: 'How do you balance Class 11-12 Board examinations with NEET & JEE preparation?',
    answer: 'We practice synchronized curriculum pacing. State and CBSE board concepts are mastered first through NCERT line-by-line understanding and derivation practice. We then systematically bridge into NEET/JEE level MCQs, tricky numerical problem-solving, and negative-marking elimination drills without overburdening the student.'
  },
  {
    id: 'faq-library-facility',
    category: 'library',
    categoryLabel: 'Library & Facilities',
    question: 'How does the student study library work, and who can access it?',
    answer: 'Our study library at 01 Sarvashree Nagar is equipped with individual study carrels, personal charging ports, warm non-glare desk lighting, and strict acoustic silence. It is open 7 days a week from 7:00 AM to 10:00 PM. Both enrolled tuition students and external library members can reserve seating for self-study and disciplined concentration.'
  },
  {
    id: 'faq-doubt-solving',
    category: 'batches',
    categoryLabel: 'Batch Sizes & Attention',
    question: 'What happens if a student misses a lecture or has persistent doubts?',
    answer: 'Every faculty member has scheduled daily doubt-clearing hours where students can sit 1-on-1 and resolve difficult homework problems. If a student misses a class due to illness or school events, backup notes and compensatory topic reviews are arranged promptly.'
  },
  {
    id: 'faq-parent-updates',
    category: 'general',
    categoryLabel: 'Parent Updates & Tracking',
    question: 'How are parents kept informed of attendance and academic progress?',
    answer: 'Parents receive regular test scorecards, attendance notifications, and teacher feedback. We hold periodic parent-mentor meetings to discuss progress, exam readiness, and areas needing extra reinforcement.'
  },
  {
    id: 'faq-enrollment',
    category: 'general',
    categoryLabel: 'Admissions & Counseling',
    question: 'How can we enroll or schedule an academic consultation?',
    answer: 'Parents and students are welcome to visit our center at 01 Sarvashree Nagar, Nagpur, or submit an enquiry online. You can also message us directly on WhatsApp (+91 70200 35514) to speak with our academic coordinators, review sample study material, and discuss batch placement.'
  }
];

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/917020035514?text=${encodeURIComponent(message)}`;
}


