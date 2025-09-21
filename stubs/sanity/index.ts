import type { ReactNode } from "react";

interface RuleBuilder<T> {
  required(): this;
  min(value: number): this;
  error(message: string): this;
}

class FakeRule<T> implements RuleBuilder<T> {
  required(): this {
    return this;
  }

  min(_value: number): this {
    return this;
  }

  error(_message: string): this {
    return this;
  }
}

export type StringRule = RuleBuilder<string>;
export type SlugRule = RuleBuilder<string>;
export type DatetimeRule = RuleBuilder<string>;
export type ArrayRule<T> = RuleBuilder<T>;

export type PreviewValue = {
  title?: string;
  subtitle?: string;
  media?: ReactNode;
};

export function defineConfig<T>(config: T): T {
  return config;
}

export function defineType<T>(typeDef: T): T {
  return typeDef;
}

export function defineField<T>(field: T): T {
  return field;
}

export function validationRule<T>(): RuleBuilder<T> {
  return new FakeRule<T>();
}
