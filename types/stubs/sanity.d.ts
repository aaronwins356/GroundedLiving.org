import type { ReactNode } from "react";

export interface BaseRule<T> {
  required(): this;
  error(message: string): this;
}

export interface StringRule extends BaseRule<string> {
  min(value: number): this;
}
export interface SlugRule extends BaseRule<string> {}
export interface DatetimeRule extends BaseRule<string> {}
export interface ArrayRule<T> extends BaseRule<T> {}

export interface PreviewValue {
  title?: string;
  subtitle?: string;
  media?: ReactNode;
}

export declare function defineConfig<T>(config: T): T;
export declare function defineField<T>(field: T): T;
export declare function defineType<T>(type: T): T;
