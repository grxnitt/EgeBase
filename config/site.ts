export const siteConfig = {
  name: "EgeBase",
  description:
    "Актуальная теория по обществознанию для подготовки к ЕГЭ-2027: структурированно, понятно и без лишнего.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://egebase.ru").replace(/\/$/, ""),
  nav: [
    { href: "/theory", label: "Теория" },
    { href: "/dictionary", label: "Словарь" },
    { href: "/tasks", label: "Задания" }
  ]
};
