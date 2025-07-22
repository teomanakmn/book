// Client-side tip tanımlamaları

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  coverImage?: string;
  totalPages?: number;
  currentPage: number;
  status: BookStatus;
  rating?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId?: string;
  category?: Category;
  quotes?: Quote[];
  tags?: BookTag[];
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  books?: Book[];
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  books?: BookTag[];
}

export interface BookTag {
  id: string;
  bookId: string;
  tagId: string;
  book?: Book;
  tag?: Tag;
}

export interface Quote {
  id: string;
  text: string;
  page?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  bookId: string;
  user?: User;
  book?: Book;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export enum BookStatus {
  TO_READ = 'TO_READ',
  READING = 'READING',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED'
}

export interface ReadingStats {
  totalBooks: number;
  completedBooks: number;
  inProgressBooks: number;
  toReadBooks: number;
  totalPages: number;
  readPages: number;
  averageRating: number;
  readingGoalProgress: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}