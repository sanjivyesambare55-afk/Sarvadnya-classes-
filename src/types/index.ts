export interface ProgramInfo {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  category: 'foundation' | 'senior' | 'competitive';
  description: string;
  focusAreas: string[];
  schedule: string;
  highlights: string[];
}

export interface EnquiryFormData {
  studentName: string;
  phoneNumber: string;
  program: string;
  message?: string;
  preferredTime?: string;
}

export interface FacultyMember {
  name: string;
  role: string;
  qualification: string;
  experience: string;
}

export interface ToppersBatch {
  id?: string;
  class: string;
  students: string[];
  month?: string;
  order?: number;
  updatedAt?: unknown;
}

export interface GalleryItem {
  title: string;
  url: string;
}

export interface SuccessMetric {
  value: number;
  suffix: string;
  label: string;
  description: string;
  category: string;
}

export interface Testimonial {
  id?: string;
  name: string;
  program: string;
  scoreOrAchievement?: string;
  year?: string;
  review: string;
  rating?: number;
  avatarUrl?: string;
  createdAt?: unknown;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'timings' | 'syllabus' | 'batches' | 'library' | 'general';
  categoryLabel: string;
}

export type SceneSectionId = 
  | 'hero' 
  | 'foundations' 
  | 'senior-secondary' 
  | 'neet' 
  | 'jee' 
  | 'library' 
  | 'achievers'
  | 'faculty'
  | 'toppers'
  | 'testimonials'
  | 'gallery'
  | 'why-us' 
  | 'faq'
  | 'contact';


