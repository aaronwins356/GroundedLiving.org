interface JsonLdProps {
  item: Record<string, unknown> | null | undefined;
  id?: string;
}

export function JsonLd({ item, id }: JsonLdProps) {
  if (!item) {
    return null;
  }

  return (
    <script type="application/ld+json" suppressHydrationWarning {...(id ? { id } : {})}>
      {JSON.stringify(item)}
    </script>
  );
}
