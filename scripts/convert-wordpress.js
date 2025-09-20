import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseStringPromise } from 'xml2js';
import TurndownService from 'turndown';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_AUTHOR = 'Aaron Winslow';
const DEFAULT_XML_FILENAME = 'groundedlifestyle.WordPress.2025-09-20.xml';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndownService.keep(['iframe']);

function toArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200) || 'post';
}

function extractCategories(item) {
  const rawCategories = toArray(item.category);
  const names = rawCategories
    .map((category) => {
      if (typeof category === 'string') {
        return category.trim();
      }

      if (!category) {
        return '';
      }

      const text = (category._ ?? '').trim();
      return text;
    })
    .filter(Boolean);

  return Array.from(new Set(names));
}

function extractExcerpt(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150);
}

function extractFeaturedImage(html) {
  if (!html) return '';
  const match = html.match(/<img[^>]*src=["']([^"'>]+)["'][^>]*>/i);
  return match ? match[1] : '';
}

function formatYamlValue(value) {
  if (Array.isArray(value)) {
    const formatted = value.map((item) => JSON.stringify(item));
    return `[${formatted.join(', ')}]`;
  }

  return JSON.stringify(value ?? '');
}

async function parseWordPressExport(xmlPath) {
  const xmlContent = await fs.readFile(xmlPath, 'utf8');
  const parsed = await parseStringPromise(xmlContent, {
    explicitArray: false,
    preserveChildrenOrder: false,
    trim: false,
  });

  const items = parsed?.rss?.channel?.item;

  if (!items) {
    throw new Error('No posts found in WordPress export.');
  }

  return Array.isArray(items) ? items : [items];
}

async function main() {
  const inputPathArg = process.argv[2];
  const xmlPath = inputPathArg
    ? path.resolve(process.cwd(), inputPathArg)
    : path.resolve(__dirname, '..', DEFAULT_XML_FILENAME);

  try {
    await fs.access(xmlPath);
  } catch (error) {
    console.error(`Could not find WordPress export file at: ${xmlPath}`);
    process.exit(1);
  }

  const postsDirectory = path.resolve(__dirname, '..', 'content', 'posts');
  await fs.mkdir(postsDirectory, { recursive: true });

  const items = await parseWordPressExport(xmlPath);

  let processedCount = 0;

  for (const item of items) {
    const postType = item['wp:post_type'];

    if (postType !== 'post') {
      continue;
    }

    const status = item['wp:status'];

    if (status && status !== 'publish') {
      continue;
    }

    const title = (item.title ?? '').trim() || 'Untitled';
    const slug = slugify((item['wp:post_name'] ?? '').trim() || title);
    const date = (item['wp:post_date'] ?? '').trim();
    const contentHtml = item['content:encoded'] ?? '';
    const excerptHtml = item['excerpt:encoded'] ?? '';

    const markdownBody = turndownService.turndown(contentHtml);
    const excerptSource = excerptHtml || contentHtml;
    const excerpt = extractExcerpt(excerptSource);
    const featuredImage = extractFeaturedImage(contentHtml);
    const categories = extractCategories(item);

    const frontmatter = {
      title,
      date,
      author: DEFAULT_AUTHOR,
      categories,
      slug,
      excerpt,
      featuredImage,
    };

    const frontmatterLines = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${formatYamlValue(value)}`)
      .join('\n');

    const markdown = `---\n${frontmatterLines}\n---\n\n${markdownBody}\n`;

    const outputPath = path.join(postsDirectory, `${slug}.mdx`);

    await fs.writeFile(outputPath, markdown, 'utf8');
    processedCount += 1;
    console.log(`Created ${outputPath}`);
  }

  console.log(`Finished processing ${processedCount} posts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
