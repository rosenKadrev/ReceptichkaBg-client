export interface DataResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface User {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  password?: string;
  avatarUrl?: string;
  dateCreated?: string;
  lastActive?: string;
  avatar?: File;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Recipe {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  typeOfProcessing: string;
  degreeOfDifficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  status: 'active' | 'rejected' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  ingredients: Ingredient[];
  instructions: Instruction[];
  images: Image[];
  createdBy: string;
  rating: Rating;
}

export interface Rating {
  averageRating: number;
  ratingCount: number;
  userRating: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface Instruction {
  id: string;
  sortOrder: number;
  description: string;
}

export interface Image {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface LookupItem {
  id: number;
  name: string;
  sortOrder: number;
}

export interface RecipeLookups {
  categories: LookupItem[];
  processingTypes: LookupItem[];
  degreeOfDifficulty: LookupItem[];
}

export interface RecipeFilters {
  currentPage: number;
  pageSize: number;
  searchText?: string;
  searchByName?: string;
  status?: string;
  categoryId?: string;
  typeOfProcessingId?: string;
  degreeOfDifficultyId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
}

export interface UserFilters {
  currentPage: number;
  pageSize: number;
  name?: string;
  email?: string;
  gender?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAtFrom?: Date | null;
  createdAtTo?: Date | null;
}

export interface ArticleCategory {
  id: string;
  name: string;
  imageUrl?: string;
  sortOrder?: number;
  articlesCount?: number;
}

export interface Paragraph {
  title?: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface Article {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  articleCategory: ArticleCategory;
  paragraphs: Paragraph[];
  mainImageUrl: string;
}

export interface ArticleParams {
  currentPage: number;
  pageSize: number;
  categoryId?: string;
}

export interface FavoritesParams {
  currentPage: number;
  pageSize: number;
}