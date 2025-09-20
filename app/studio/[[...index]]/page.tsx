import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio",
};

export const runtime = "nodejs";
export const revalidate = 0;

export default function StudioPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-100 text-center text-sm text-slate-600">
      Sanity Studio is unavailable in this offline preview.
    </div>
  );
}
