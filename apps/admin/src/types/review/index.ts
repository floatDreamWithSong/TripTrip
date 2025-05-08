export interface Review {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  images: string[];
  video?: string;
  content: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}
