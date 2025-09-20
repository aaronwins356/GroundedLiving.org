interface ImageState {
  src: string;
}

function createBuilder(state: ImageState) {
  const builder = {
    width(_value: number) {
      return builder;
    },
    height(_value: number) {
      return builder;
    },
    fit(_value: string) {
      return builder;
    },
    auto(_value: string) {
      return builder;
    },
    url() {
      return state.src;
    },
  };

  return builder;
}

export default function createImageUrlBuilder(_config: Record<string, unknown>) {
  return {
    image(source: unknown) {
      const src =
        typeof source === "object" && source !== null && "asset" in source
          ? // @ts-expect-error - runtime guard ensures safe access
            source.asset?._ref ?? ""
          : "";

      return createBuilder({ src: typeof src === "string" ? src : "" });
    },
  };
}
