const defaultStudioHost = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL;
const projectId = process.env.SANITY_PROJECT_ID;

function buildDefaultStudioUrl() {
  if (defaultStudioHost) {
    return defaultStudioHost;
  }

  if (projectId) {
    return `https://${projectId}.sanity.studio`;
  }

  return null;
}

export default function StudioPage() {
  const studioUrl = buildDefaultStudioUrl();

  if (!studioUrl) {
    return (
      <section className="space-y-4 rounded-3xl bg-white/70 p-10 text-accent shadow-soft-lg">
        <h1 className="text-2xl font-semibold">Connect Sanity Studio</h1>
        <p className="text-sm text-accent-soft">
          Add <code className="rounded bg-brand-50 px-2 py-1">SANITY_PROJECT_ID</code> to your environment variables or set
          <code className="ml-2 rounded bg-brand-50 px-2 py-1">NEXT_PUBLIC_SANITY_STUDIO_URL</code> to embed your hosted studio
          here.
        </p>
      </section>
    );
  }

  return (
    <section className="h-[calc(100vh-160px)] rounded-3xl bg-white/70 shadow-soft-lg">
      <iframe
        title="Sanity Studio"
        src={studioUrl}
        className="h-full w-full rounded-3xl"
      />
    </section>
  );
}
