export function assignRef<T>(ref: unknown, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref && typeof ref === "object" && "current" in ref) {
    (ref as { current: T | null }).current = value;
  }
}
