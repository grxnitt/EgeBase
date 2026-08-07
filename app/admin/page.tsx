import type { Metadata } from "next";
import path from "node:path";
import { AdminEditor } from "@/components/admin/admin-editor";
import { Badge } from "@/components/ui/badge";
import { theorySections } from "@/config/theory";
import { listAdminArticles } from "@/lib/admin-content";

export const metadata: Metadata = {
  title: "Локальная админка",
  description: "Локальный редактор статей EgeBase.",
  robots: { index: false, follow: false }
};

function getAdminArticles() {
  return listAdminArticles({
    contentRoot: path.join(process.cwd(), "content"),
    sections: theorySections
  });
}

export default function AdminPage() {
  if (process.env.NODE_ENV !== "development") {
    return (
      <main className="container-shell py-20">
        <Badge>Только локально</Badge>
        <h1 className="mt-6 font-serif text-5xl leading-tight">Локальная админка недоступна.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          Редактор статей работает только при запуске проекта через <code>npm run dev</code>.
        </p>
      </main>
    );
  }

  const articles = getAdminArticles();

  return (
    <main className="container-shell py-12">
      <div className="border-b border-border pb-8">
        <p className="editorial-label">Локальная админка</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">Редактор статей</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Здесь можно править текст MDX-статей без открытия файлов в VS Code. Metadata пока
          показывается только для контроля и не редактируется.
        </p>
      </div>

      <AdminEditor initialArticles={articles} />
    </main>
  );
}
