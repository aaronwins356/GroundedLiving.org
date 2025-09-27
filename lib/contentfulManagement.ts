import "server-only";

import { Buffer } from "node:buffer";
import { createClient } from "contentful-management";

import type { RichTextDocument } from "../types/contentful";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const DEFAULT_LOCALE = process.env.CONTENTFUL_DEFAULT_LOCALE ?? "en-US";

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.warn("Contentful management credentials are missing. Studio operations will fail until configured.");
}

interface ManagementEntry {
  sys: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string | null;
  };
  fields: Record<string, Record<string, unknown>>;
  isPublished(): boolean;
  publish(): Promise<ManagementEntry>;
  unpublish(): Promise<ManagementEntry>;
  update(): Promise<ManagementEntry>;
  delete(): Promise<void>;
}

interface ManagementAsset {
  sys: { id: string };
  fields: Record<string, Record<string, any>>;
  processForAllLocales(): Promise<ManagementAsset>;
  publish(): Promise<ManagementAsset>;
}

interface ManagementEnvironment {
  getEntries(query: Record<string, unknown>): Promise<{
    items: ManagementEntry[];
    total: number;
    skip: number;
    limit: number;
  }>;
  getEntry(id: string): Promise<ManagementEntry>;
  createEntry(contentTypeId: string, data: { fields: Record<string, unknown> }): Promise<ManagementEntry>;
  getAsset(id: string): Promise<ManagementAsset>;
  createAssetFromFiles(data: {
    fields: {
      title: Record<string, string>;
      description: Record<string, string | null>;
      file: Record<string, { contentType: string; fileName: string; file: Blob | Buffer }>;
    };
  }): Promise<ManagementAsset>;
}

let cachedEnvironment: Promise<ManagementEnvironment> | null = null;

async function getEnvironment(): Promise<ManagementEnvironment> {
  if (!SPACE_ID || !MANAGEMENT_TOKEN) {
    throw new Error("Contentful management credentials are not configured");
  }

  if (!cachedEnvironment) {
    const client = createClient({ accessToken: MANAGEMENT_TOKEN });
    cachedEnvironment = client
      .getSpace(SPACE_ID)
      .then((space) => space.getEnvironment(ENVIRONMENT_ID) as unknown as ManagementEnvironment)
      .catch((error) => {
        cachedEnvironment = null;
        throw error;
      });
  }

  return cachedEnvironment;
}

function getLocalizedField<T>(fields: Record<string, Record<string, unknown>>, fieldId: string): T | null {
  const value = fields?.[fieldId]?.[DEFAULT_LOCALE];
  return (value as T | undefined) ?? null;
}

function setLocalizedField(entry: ManagementEntry, fieldId: string, value: unknown) {
  if (!entry.fields[fieldId]) {
    entry.fields[fieldId] = {};
  }

  const field = entry.fields[fieldId];

  if (value === null) {
    delete field[DEFAULT_LOCALE];
    return;
  }

  field[DEFAULT_LOCALE] = value;
}

function createAssetLink(id: string | null | undefined) {
  if (!id) {
    return null;
  }

  return {
    sys: {
      type: "Link",
      linkType: "Asset",
      id,
    },
  };
}

function createEntryLink(id: string | null | undefined) {
  if (!id) {
    return null;
  }

  return {
    sys: {
      type: "Link",
      linkType: "Entry",
      id,
    },
  };
}

export interface StudioAsset {
  id: string;
  url?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface StudioSEO {
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  ogImage?: StudioAsset | null;
}

export interface EntrySummary {
  id: string;
  title: string;
  slug?: string | null;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published";
  publishedAt?: string | null;
}

export interface BlogPostSummary extends EntrySummary {
  excerpt?: string | null;
  datePublished?: string | null;
  coverImage?: StudioAsset | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: RichTextDocument | null;
  authorId?: string | null;
}

export interface PageSummary extends EntrySummary {
  navigationLabel?: string | null;
}

export interface PageDetail extends PageSummary {
  content: RichTextDocument | null;
  heroImage?: StudioAsset | null;
  seo: StudioSEO;
}

export interface AuthorDetail extends EntrySummary {
  bio?: string | null;
  profileImage?: StudioAsset | null;
}

export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
}

export interface PaginatedResponse<T> extends PaginationMeta {
  items: T[];
}

async function mapAsset(environment: ManagementEnvironment, link: any): Promise<StudioAsset | null> {
  const assetId = link?.sys?.id as string | undefined;

  if (!assetId) {
    return null;
  }

  const asset = await environment.getAsset(assetId).catch(() => null);

  if (!asset) {
    return null;
  }

  const file = asset.fields.file?.[DEFAULT_LOCALE];

  return {
    id: asset.sys.id,
    url: (file && "url" in file ? file.url : undefined) ?? undefined,
    title: asset.fields.title?.[DEFAULT_LOCALE],
    description: asset.fields.description?.[DEFAULT_LOCALE],
  } satisfies StudioAsset;
}

function mapEntryStatus(entry: ManagementEntry): "draft" | "published" {
  return entry.isPublished() ? "published" : "draft";
}

function mapBlogPostSummary(entry: ManagementEntry): BlogPostSummary {
  return {
    id: entry.sys.id,
    title: getLocalizedField<string>(entry.fields, "title") ?? "Untitled post",
    slug: getLocalizedField<string>(entry.fields, "slug"),
    excerpt: getLocalizedField<string>(entry.fields, "excerpt"),
    datePublished: getLocalizedField<string>(entry.fields, "date-published"),
    seoTitle: getLocalizedField<string>(entry.fields, "seoTitle"),
    seoDescription: getLocalizedField<string>(entry.fields, "seo-description"),
    createdAt: entry.sys.createdAt ?? new Date().toISOString(),
    updatedAt: entry.sys.updatedAt ?? new Date().toISOString(),
    status: mapEntryStatus(entry),
    publishedAt: entry.sys.publishedAt ?? null,
  } satisfies BlogPostSummary;
}

async function mapBlogPostDetail(environment: ManagementEnvironment, entry: ManagementEntry): Promise<BlogPostDetail> {
  const summary = mapBlogPostSummary(entry);
  const coverImage = await mapAsset(environment, getLocalizedField(entry.fields, "coverImage"));

  return {
    ...summary,
    content: getLocalizedField<RichTextDocument>(entry.fields, "content"),
    authorId: getLocalizedField<any>(entry.fields, "author")?.sys?.id ?? null,
    coverImage,
  } satisfies BlogPostDetail;
}

function mapPageSummary(entry: ManagementEntry): PageSummary {
  return {
    id: entry.sys.id,
    title: getLocalizedField<string>(entry.fields, "title") ?? "Untitled page",
    slug: getLocalizedField<string>(entry.fields, "slug"),
    navigationLabel: getLocalizedField<string>(entry.fields, "navigationLabel"),
    createdAt: entry.sys.createdAt ?? new Date().toISOString(),
    updatedAt: entry.sys.updatedAt ?? new Date().toISOString(),
    status: mapEntryStatus(entry),
    publishedAt: entry.sys.publishedAt ?? null,
  } satisfies PageSummary;
}

async function mapPageDetail(environment: ManagementEnvironment, entry: ManagementEntry): Promise<PageDetail> {
  const summary = mapPageSummary(entry);
  const heroImage = await mapAsset(environment, getLocalizedField(entry.fields, "heroImage"));
  const ogImage = await mapAsset(environment, getLocalizedField(entry.fields, "seoImage"));

  return {
    ...summary,
    content: getLocalizedField<RichTextDocument>(entry.fields, "content"),
    heroImage,
    seo: {
      title: getLocalizedField<string>(entry.fields, "seoTitle") ?? summary.title,
      description: getLocalizedField<string>(entry.fields, "seoDescription"),
      canonicalUrl: getLocalizedField<string>(entry.fields, "seoCanonicalUrl"),
      ogImage,
    },
  } satisfies PageDetail;
}

async function mapAuthorDetail(environment: ManagementEnvironment, entry: ManagementEntry): Promise<AuthorDetail> {
  const profileImage = await mapAsset(environment, getLocalizedField(entry.fields, "avatarImage"));

  return {
    id: entry.sys.id,
    title: getLocalizedField<string>(entry.fields, "name") ?? "Author",
    slug: null,
    bio: getLocalizedField<string>(entry.fields, "bio"),
    createdAt: entry.sys.createdAt ?? new Date().toISOString(),
    updatedAt: entry.sys.updatedAt ?? new Date().toISOString(),
    status: mapEntryStatus(entry),
    publishedAt: entry.sys.publishedAt ?? null,
    profileImage,
  } satisfies AuthorDetail;
}

function applyBlogPostFields(entry: ManagementEntry, data: Partial<BlogPostDetail>) {
  if (data.title !== undefined) setLocalizedField(entry, "title", data.title ?? null);
  if (data.slug !== undefined) setLocalizedField(entry, "slug", data.slug ?? null);
  if (data.excerpt !== undefined) setLocalizedField(entry, "excerpt", data.excerpt ?? null);
  if (data.content !== undefined) setLocalizedField(entry, "content", data.content ?? null);
  if (data.datePublished !== undefined) setLocalizedField(entry, "date-published", data.datePublished ?? null);
  if (data.seoDescription !== undefined) setLocalizedField(entry, "seo-description", data.seoDescription ?? null);
  if (data.coverImage !== undefined) setLocalizedField(entry, "coverImage", createAssetLink(data.coverImage?.id));
  if (data.authorId !== undefined) setLocalizedField(entry, "author", createEntryLink(data.authorId));
}

function applyPageFields(entry: ManagementEntry, data: Partial<PageDetail>) {
  if (data.title !== undefined) setLocalizedField(entry, "title", data.title ?? null);
  if (data.slug !== undefined) setLocalizedField(entry, "slug", data.slug ?? null);
  if (data.navigationLabel !== undefined)
    setLocalizedField(entry, "navigationLabel", data.navigationLabel ?? null);
  if (data.content !== undefined) setLocalizedField(entry, "content", data.content ?? null);
  if (data.seo?.title !== undefined) setLocalizedField(entry, "seoTitle", data.seo?.title ?? null);
  if (data.seo?.description !== undefined)
    setLocalizedField(entry, "seoDescription", data.seo?.description ?? null);
  if (data.seo?.canonicalUrl !== undefined)
    setLocalizedField(entry, "seoCanonicalUrl", data.seo?.canonicalUrl ?? null);
  if (data.seo?.ogImage !== undefined)
    setLocalizedField(entry, "seoImage", createAssetLink(data.seo?.ogImage?.id));
  if (data.heroImage !== undefined) setLocalizedField(entry, "heroImage", createAssetLink(data.heroImage?.id));
}

function applyAuthorFields(entry: ManagementEntry, data: Partial<AuthorDetail>) {
  if (data.title !== undefined) setLocalizedField(entry, "name", data.title ?? null);
  if (data.bio !== undefined) setLocalizedField(entry, "bio", data.bio ?? null);
  if (data.profileImage !== undefined)
    setLocalizedField(entry, "avatarImage", createAssetLink(data.profileImage?.id));
}

async function syncPublishState(entry: ManagementEntry, status: "draft" | "published") {
  if (status === "published") {
    return entry.publish();
  }

  if (entry.isPublished()) {
    return entry.unpublish();
  }

  return entry;
}

export async function getBlogPosts({ skip = 0, limit = 20, search }: { skip?: number; limit?: number; search?: string } = {}): Promise<PaginatedResponse<BlogPostSummary>> {
  const environment = await getEnvironment();
  const response = await environment.getEntries({
    content_type: "blogPost",
    skip,
    limit,
    order: "-sys.updatedAt",
    query: search,
  });

  return {
    items: response.items.map(mapBlogPostSummary),
    total: response.total,
    skip: response.skip,
    limit: response.limit,
  } satisfies PaginatedResponse<BlogPostSummary>;
}

export async function getBlogPost(id: string): Promise<BlogPostDetail> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);
  return mapBlogPostDetail(environment, entry);
}

export async function createBlogPost(data: Partial<BlogPostDetail> & { title: string }): Promise<BlogPostDetail> {
  const environment = await getEnvironment();
  const entry = await environment.createEntry("blogPost", { fields: {} });
  applyBlogPostFields(entry, data);
  const saved = await entry.update();
  const synced = await syncPublishState(saved, data.status ?? "draft");
  return mapBlogPostDetail(environment, synced);
}

export async function updateBlogPost(id: string, data: Partial<BlogPostDetail>): Promise<BlogPostDetail> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);
  applyBlogPostFields(entry, data);
  const updated = await entry.update();
  const synced = await syncPublishState(updated, data.status ?? mapEntryStatus(updated));
  return mapBlogPostDetail(environment, synced);
}

export async function deleteBlogPost(id: string): Promise<void> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);

  if (entry.isPublished()) {
    await entry.unpublish();
  }

  await entry.delete();
}

export async function getPages({ skip = 0, limit = 20, search }: { skip?: number; limit?: number; search?: string } = {}): Promise<PaginatedResponse<PageSummary>> {
  const environment = await getEnvironment();
  const response = await environment.getEntries({
    content_type: "page",
    skip,
    limit,
    order: "-sys.updatedAt",
    query: search,
  });

  return {
    items: response.items.map(mapPageSummary),
    total: response.total,
    skip: response.skip,
    limit: response.limit,
  } satisfies PaginatedResponse<PageSummary>;
}

export async function getPage(id: string): Promise<PageDetail> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);
  return mapPageDetail(environment, entry);
}

export async function createPage(data: Partial<PageDetail> & { title: string }): Promise<PageDetail> {
  const environment = await getEnvironment();
  const entry = await environment.createEntry("page", { fields: {} });
  applyPageFields(entry, data);
  const saved = await entry.update();
  const synced = await syncPublishState(saved, data.status ?? "draft");
  return mapPageDetail(environment, synced);
}

export async function updatePage(id: string, data: Partial<PageDetail>): Promise<PageDetail> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);
  applyPageFields(entry, data);
  const updated = await entry.update();
  const synced = await syncPublishState(updated, data.status ?? mapEntryStatus(updated));
  return mapPageDetail(environment, synced);
}

export async function deletePage(id: string): Promise<void> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);

  if (entry.isPublished()) {
    await entry.unpublish();
  }

  await entry.delete();
}

export async function getAuthors({ skip = 0, limit = 50, search }: { skip?: number; limit?: number; search?: string } = {}): Promise<PaginatedResponse<AuthorDetail>> {
  const environment = await getEnvironment();
  const response = await environment.getEntries({
    content_type: "author",
    skip,
    limit,
    order: "fields.name",
    query: search,
  });

  const items = await Promise.all(response.items.map((entry) => mapAuthorDetail(environment, entry)));

  return {
    items,
    total: response.total,
    skip: response.skip,
    limit: response.limit,
  } satisfies PaginatedResponse<AuthorDetail>;
}

export async function getAuthor(id: string): Promise<AuthorDetail> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);
  return mapAuthorDetail(environment, entry);
}

export async function createAuthor(data: Partial<AuthorDetail> & { title: string }): Promise<AuthorDetail> {
  const environment = await getEnvironment();
  const entry = await environment.createEntry("author", { fields: {} });
  applyAuthorFields(entry, data);
  const saved = await entry.update();
  const synced = await syncPublishState(saved, data.status ?? "draft");
  return mapAuthorDetail(environment, synced);
}

export async function updateAuthor(id: string, data: Partial<AuthorDetail>): Promise<AuthorDetail> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);
  applyAuthorFields(entry, data);
  const updated = await entry.update();
  const synced = await syncPublishState(updated, data.status ?? mapEntryStatus(updated));
  return mapAuthorDetail(environment, synced);
}

export async function deleteAuthor(id: string): Promise<void> {
  const environment = await getEnvironment();
  const entry = await environment.getEntry(id);

  if (entry.isPublished()) {
    await entry.unpublish();
  }

  await entry.delete();
}

export interface AssetUploadPayload {
  file: Blob | Buffer;
  fileName: string;
  contentType: string;
  title?: string;
  description?: string;
}

async function toNodeBuffer(blobOrBuffer: Blob | Buffer): Promise<Buffer> {
  if (Buffer.isBuffer(blobOrBuffer)) {
    return blobOrBuffer;
  }

  const blob = blobOrBuffer as Blob;
  if (typeof blob.arrayBuffer !== "function") {
    throw new Error("Unsupported file payload: expected Blob with arrayBuffer() method");
  }

  // Contentful's management SDK expects a Node.js Buffer. Convert incoming Blob/File
  // instances (produced by the Web Fetch API) so uploads succeed inside Vercel's
  // Node-based serverless runtime without relying on experimental Blob support.
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function uploadAsset(payload: AssetUploadPayload): Promise<StudioAsset> {
  const environment = await getEnvironment();
  const fileBuffer = await toNodeBuffer(payload.file);

  const asset = await environment.createAssetFromFiles({
    fields: {
      title: { [DEFAULT_LOCALE]: payload.title ?? payload.fileName },
      description: { [DEFAULT_LOCALE]: payload.description ?? null },
      file: {
        [DEFAULT_LOCALE]: {
          contentType: payload.contentType,
          fileName: payload.fileName,
          file: fileBuffer,
        },
      },
    },
  });

  const processed = await asset.processForAllLocales();
  const published = await processed.publish();
  const file = published.fields.file?.[DEFAULT_LOCALE];

  return {
    id: published.sys.id,
    url: file?.url,
    title: published.fields.title?.[DEFAULT_LOCALE],
    description: published.fields.description?.[DEFAULT_LOCALE],
  } satisfies StudioAsset;
}
