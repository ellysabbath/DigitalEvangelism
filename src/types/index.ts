export interface MenuItem {
  label: string;
  href?: string;
  subItems?: MenuItem[];
}

export interface SlideItem {
  id: number | string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
}

export interface NewsItem {
  id: number | string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  views: number;
  link: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface FooterLink {
  label: string;
  url: string;
}