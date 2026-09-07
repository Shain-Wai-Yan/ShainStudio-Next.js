export interface Photo {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  location: string;
  category?: string;   // always a plain string — never an object
  image: string | null;
  width?: number;      // intrinsic pixel width  — reserves aspect ratio (no CLS)
  height?: number;     // intrinsic pixel height — reserves aspect ratio (no CLS)
  altText?: string;    // dedicated CMS alt text (falls back to title downstream)
  tags?: string[];     // always string[] — never objects
  language: 'en' | 'zh';
  createdAt: string;
  updatedAt: string;
}
