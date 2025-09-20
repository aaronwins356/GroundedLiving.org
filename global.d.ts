declare module "some-other-lib";

declare module "next" {
  export * from "next/types";
  export { default } from "next/types";

  export interface PageProps {
    params?: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}

declare module "next-sanity" {
  export type SanityClient = {
    fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>;
  };

  export function createClient(config: Record<string, unknown>): SanityClient;
  export function groq(strings: TemplateStringsArray, ...values: unknown[]): string;
}

declare module "next-sanity/studio" {
  import type { ComponentType } from "react";

  export interface NextStudioProps {
    config: unknown;
  }

  export const NextStudio: ComponentType<NextStudioProps>;
}

declare module "@sanity/image-url" {
  interface ImageBuilder {
    width(width: number): ImageBuilder;
    height(height: number): ImageBuilder;
    fit(fit: string): ImageBuilder;
    auto(auto: string): ImageBuilder;
    url(): string;
  }

  export default function createImageUrlBuilder(config: Record<string, unknown>): {
    image(source: unknown): ImageBuilder;
  };
}

declare module "sanity" {
  export interface Rule {
    required(): Rule;
    min(value: number): Rule;
    error(message: string): Rule;
  }

  export interface StringRule extends Rule {}
  export interface SlugRule extends Rule {}
  export interface DatetimeRule extends Rule {}
  export interface ArrayRule<T> extends Rule {}

  export interface PreviewValue {
    title?: string;
    subtitle?: string;
    media?: unknown;
  }

  export function defineConfig<T>(config: T): T;
  export function defineType<T>(input: T): T;
  export function defineField<T>(input: T): T;
}

declare module "sanity/desk" {
  export function deskTool(): unknown;
}
