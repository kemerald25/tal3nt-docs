export type DocPage = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  lastUpdated: string;
  content: string;
  sectionId: string;
};

export type DocSection = {
  id: string;
  title: string;
  description: string;
  pages: DocPage[];
};

export type DocsResponse = {
  sections: DocSection[];
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  tags: string[];
  heroImage?: string;
  content: string;
};

export type BlogResponse = {
  posts: BlogPost[];
};
