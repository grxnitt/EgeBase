export type TopicStatus = "published" | "coming-soon";
export type TheorySectionStatus = "available" | "coming-soon";

export type ComingSoonTopic = {
  title: string;
  slug: string;
  order: number;
};

export type TheorySection = {
  title: string;
  slug: string;
  description: string;
  status: TheorySectionStatus;
  order: number;
  contentDir?: string;
  href?: string;
  comingSoonTopics?: ComingSoonTopic[];
};

export type ArticleMeta = {
  title: string;
  slug: string;
  description: string;
  section: string;
  status: TopicStatus;
  examYear: number;
  examTasks: number[];
  order: number;
  previous?: string;
  next?: string;
  planTask?: ExamPlanTask;
  planTasks: ExamPlanTask[];
};

export type Article = {
  meta: ArticleMeta;
  body: string;
};

export type ExamPlanPoint = {
  title: string;
  children?: string[];
};

export type ExamPlanTask = {
  title: string;
  prompt: string;
  points: ExamPlanPoint[];
};

export type TocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export type TopicSearchItem = {
  title: string;
  slug: string;
  section: string;
  status: TopicStatus;
  href?: string;
  order: number;
};
