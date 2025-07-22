// Ortak tip tanımlamaları

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverImage?: string;
  description?: string;
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  categories?: string[];
  language?: string;
  rating?: number; // 1-5 arası
  status: ReadingStatus;
  progress?: number; // 0-100 arası yüzde
  currentPage?: number;
  startDate?: Date;
  finishDate?: Date;
  notes?: string;
  quotes?: Quote[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Quote {
  id: string;
  content: string;
  page?: number;
  bookId: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hashed
  name?: string;
  profilePicture?: string;
  readingGoal?: number; // Yıllık hedef kitap sayısı
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  books?: Book[];
}

export interface Tag {
  id: string;
  name: string;
  userId: string;
  books?: Book[];
}

export enum ReadingStatus {
  TO_READ = 'TO_READ',
  READING = 'READING',
  COMPLETED = 'COMPLETED',
  DNF = 'DNF' // Did Not Finish
}

export interface ReadingStats {
  totalBooks: number;
  completedBooks: number;
  inProgressBooks: number;
  toReadBooks: number;
  totalPages: number;
  readPages: number;
  averageRating: number;
  readingGoalProgress: number; // 0-100 arası yüzde
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}