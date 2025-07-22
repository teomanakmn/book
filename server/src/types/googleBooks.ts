// Google Books API yanıt tipleri
export interface GoogleBooksResponse {
  items?: GoogleBookItem[];
  totalItems?: number;
  kind?: string;
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    publishedDate?: string;
    publisher?: string;
    categories?: string[];
    language?: string;
    averageRating?: number;
    ratingsCount?: number;
  };
}

export interface BookRecommendation {
  googleId: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  pageCount: number | null;
  categories: string[];
  averageRating: number | null;
  recommendationType: string;
  recommendationReason: string;
}