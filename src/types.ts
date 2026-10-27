export interface Page {
  path: string;
  title: string;
  description: string;
  bodyClass: string;
  html: string;
}
export interface ImageAsset {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
}
export interface Payload {
  page: Page;
  images: Record<string, ImageAsset>;
  footer: string;
}
export interface Program {
  id: string;
  name: string;
  category: string;
  audience: string;
  duration: string;
  description: string;
  number: string;
}
