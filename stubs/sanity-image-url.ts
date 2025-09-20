interface ImageUrlBuilderState {
  source: unknown;
  width?: number;
  height?: number;
  fit?: string;
  auto?: string;
}

function createChain(state: ImageUrlBuilderState) {
  return {
    width(value: number) {
      state.width = value;
      return createChain(state);
    },
    height(value: number) {
      state.height = value;
      return createChain(state);
    },
    fit(value: string) {
      state.fit = value;
      return createChain(state);
    },
    auto(value: string) {
      state.auto = value;
      return createChain(state);
    },
    url() {
      if (typeof state.source === "string") {
        return state.source;
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280"><rect width="400" height="280" fill="#e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="sans-serif" font-size="20">Image unavailable offline</text></svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    },
  };
}

export default function createImageUrlBuilder() {
  return {
    image(source: unknown) {
      return createChain({ source });
    },
  };
}
