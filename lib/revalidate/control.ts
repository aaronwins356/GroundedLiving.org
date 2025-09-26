import { revalidatePath, revalidateTag } from "next/cache";

let revalidatePathImpl = revalidatePath;
let revalidateTagImpl = revalidateTag;

export function revalidatePathWithMocks(path: string) {
  revalidatePathImpl(path);
}

export function revalidateTagWithMocks(tag: string) {
  revalidateTagImpl(tag);
}

export function setRevalidateMocks(overrides: {
  revalidatePath?: typeof revalidatePath;
  revalidateTag?: typeof revalidateTag;
}) {
  if (overrides.revalidatePath) {
    revalidatePathImpl = overrides.revalidatePath;
  }

  if (overrides.revalidateTag) {
    revalidateTagImpl = overrides.revalidateTag;
  }
}

export function resetRevalidateMocks() {
  revalidatePathImpl = revalidatePath;
  revalidateTagImpl = revalidateTag;
}
