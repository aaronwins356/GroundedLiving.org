export type Rule = {
  required(): Rule;
  min(value: number): Rule;
  error(message: string): Rule;
};

export type StringRule = Rule;
export type SlugRule = Rule;
export type DatetimeRule = Rule;
export type ArrayRule<T> = Rule;

export type PreviewValue = {
  title?: string;
  subtitle?: string;
  media?: unknown;
};

class BasicRule implements Rule {
  required() {
    return this;
  }

  min(_value: number) {
    return this;
  }

  error(_message: string) {
    return this;
  }
}

export function defineConfig<T>(config: T): T {
  return config;
}

export function defineType<T>(input: T): T {
  return input;
}

export function defineField<T>(input: T): T {
  return input;
}

export function rule(): Rule {
  return new BasicRule();
}
