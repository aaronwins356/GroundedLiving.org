// Global type declarations placeholder. Add shared ambient types here when needed.

// Minimal Jest globals to allow ts-jest without @types/jest
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: <T = unknown>(actual: T) => {
  toBe: (expected: T) => void;
  toHaveLength: (expected: number) => void;
  toContain: (expected: string) => void;
};

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};

declare module "prismjs";
declare module "prismjs/components/*";
