import path from "node:path";
import { theorySections } from "@/config/theory";
import {
  listAdminArticles,
  readAdminArticle,
  writeAdminArticleBody
} from "@/lib/admin-content";

export const dynamic = "force-dynamic";

function getAdminContentOptions() {
  return {
    contentRoot: path.join(process.cwd(), "content"),
    sections: theorySections
  };
}

function ensureDevelopment() {
  return process.env.NODE_ENV === "development";
}

function unavailableResponse() {
  return Response.json(
    { error: "Локальная админка доступна только в режиме разработки." },
    { status: 404 }
  );
}

export async function GET(request: Request) {
  if (!ensureDevelopment()) {
    return unavailableResponse();
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    if (id) {
      return Response.json({ article: readAdminArticle(id, getAdminContentOptions()) });
    }

    return Response.json({ articles: listAdminArticles(getAdminContentOptions()) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не удалось прочитать статью." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  if (!ensureDevelopment()) {
    return unavailableResponse();
  }

  try {
    const payload = (await request.json()) as { id?: unknown; body?: unknown };
    if (typeof payload.id !== "string" || typeof payload.body !== "string") {
      return Response.json({ error: "Нужны id статьи и body." }, { status: 400 });
    }

    const article = writeAdminArticleBody(payload.id, payload.body, getAdminContentOptions());
    return Response.json({ article });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Не удалось сохранить статью." },
      { status: 400 }
    );
  }
}
