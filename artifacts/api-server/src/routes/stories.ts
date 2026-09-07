import { and, desc, eq, ilike, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateStoryBody,
  CreateStoryResponse,
  GetStoryBySlugParams,
  GetStoryBySlugResponse,
  GetStoryParams,
  GetStoryResponse,
  ListStoriesQueryParams,
  ListStoriesResponse,
  PublishStoryParams,
  PublishStoryResponse,
  UnpublishStoryParams,
  UnpublishStoryResponse,
  UpdateStoryBody,
  UpdateStoryParams,
  UpdateStoryResponse,
} from "@workspace/api-zod";
import { db, storiesTable } from "@workspace/db";

const router: IRouter = Router();

const storyResponse = (story: typeof storiesTable.$inferSelect) => ({
  ...story,
  date: dateOnly(story.date),
  tags: story.tags ?? [],
});

const dateOnly = (value: Date | string): string =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);

const normalizeTags = (tags: string[]) =>
  tags.map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean);

const serializeStory = <T extends {
  date: Date | string;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}>(story: T) => ({
  ...story,
  date: dateOnly(story.date),
  publishedAt: story.publishedAt ? new Date(story.publishedAt).toISOString() : null,
  createdAt: new Date(story.createdAt).toISOString(),
  updatedAt: new Date(story.updatedAt).toISOString(),
});

router.get("/stories", async (req, res): Promise<void> => {
  const parsedQuery = ListStoriesQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const { status, category, q } = parsedQuery.data;
  const conditions = [];
  if (!status || status === "published") {
    conditions.push(eq(storiesTable.status, "published"));
  } else if (status === "draft") {
    conditions.push(eq(storiesTable.status, "draft"));
  }
  if (category) conditions.push(eq(storiesTable.category, category));
  if (q) {
    conditions.push(
      or(
        ilike(storiesTable.title, `%${q}%`),
        ilike(storiesTable.excerpt, `%${q}%`),
        ilike(storiesTable.author, `%${q}%`),
      ),
    );
  }

  const stories = await db
    .select()
    .from(storiesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(storiesTable.date), desc(storiesTable.updatedAt));

  res.json(ListStoriesResponse.parse(stories.map(storyResponse)).map(serializeStory));
});

router.post("/stories", async (req, res): Promise<void> => {
  const parsed = CreateStoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [story] = await db
      .insert(storiesTable)
      .values({
        ...parsed.data,
        date: dateOnly(parsed.data.date),
        tags: normalizeTags(parsed.data.tags),
        status: "draft",
      })
      .returning();
    res.status(201).json(serializeStory(CreateStoryResponse.parse(storyResponse(story))));
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      res.status(409).json({ error: "A story with that slug already exists" });
      return;
    }
    req.log.error({ err: error }, "Unable to create story");
    res.status(500).json({ error: "Unable to create story" });
  }
});

router.get("/stories/slug/:slug", async (req, res): Promise<void> => {
  const parsed = GetStoryBySlugParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [story] = await db
    .select()
    .from(storiesTable)
    .where(and(eq(storiesTable.slug, parsed.data.slug), eq(storiesTable.status, "published")));
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  res.json(serializeStory(GetStoryBySlugResponse.parse(storyResponse(story))));
});

router.get("/stories/:id", async (req, res): Promise<void> => {
  const parsed = GetStoryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [story] = await db
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.id, parsed.data.id));
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  res.json(serializeStory(GetStoryResponse.parse(storyResponse(story))));
});

router.patch("/stories/:id", async (req, res): Promise<void> => {
  const parsedParams = UpdateStoryParams.safeParse(req.params);
  const parsedBody = UpdateStoryBody.safeParse(req.body);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const { date, tags, ...storyFields } = parsedBody.data;
  const updates: Partial<typeof storiesTable.$inferInsert> = {
    ...storyFields,
    ...(date ? { date: dateOnly(date) } : {}),
    ...(tags ? { tags: normalizeTags(tags) } : {}),
    updatedAt: new Date(),
  };
  try {
    const [story] = await db
      .update(storiesTable)
      .set(updates)
      .where(eq(storiesTable.id, parsedParams.data.id))
      .returning();
    if (!story) {
      res.status(404).json({ error: "Story not found" });
      return;
    }
    res.json(serializeStory(UpdateStoryResponse.parse(storyResponse(story))));
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      res.status(409).json({ error: "A story with that slug already exists" });
      return;
    }
    req.log.error({ err: error }, "Unable to update story");
    res.status(500).json({ error: "Unable to update story" });
  }
});

router.post("/stories/:id/publish", async (req, res): Promise<void> => {
  const parsed = PublishStoryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(storiesTable).where(eq(storiesTable.id, parsed.data.id));
  if (!existing) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  if (!existing.title || !existing.slug || !existing.excerpt || !existing.author || !existing.category || !existing.body) {
    res.status(400).json({ error: "Add a title, slug, excerpt, category, author, and body before publishing" });
    return;
  }
  const [story] = await db
    .update(storiesTable)
    .set({ status: "published", publishedAt: existing.publishedAt ?? new Date(), updatedAt: new Date() })
    .where(eq(storiesTable.id, parsed.data.id))
    .returning();
  res.json(serializeStory(PublishStoryResponse.parse(storyResponse(story))));
});

router.post("/stories/:id/unpublish", async (req, res): Promise<void> => {
  const parsed = UnpublishStoryParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [story] = await db
    .update(storiesTable)
    .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
    .where(eq(storiesTable.id, parsed.data.id))
    .returning();
  if (!story) {
    res.status(404).json({ error: "Story not found" });
    return;
  }
  res.json(serializeStory(UnpublishStoryResponse.parse(storyResponse(story))));
});

export default router;