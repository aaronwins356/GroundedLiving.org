// Minimal React type stubs to allow TypeScript checking without network access.
// These definitions intentionally cover only the APIs consumed within the
// Grounded Living codebase and fall back to `any` where necessary. When the real
// @types/react package is available it will take precedence.

declare namespace React {
  type Key = string | number | null;
  type ReactText = string | number;
  type ReactChild = ReactElement | ReactText;
  type ReactNode = ReactChild | ReactNode[] | boolean | null | undefined;

  interface Attributes {
    key?: Key;
  }

  interface ClassAttributes<T> extends Attributes {
    ref?: ((instance: T | null) => void) | null;
  }

  interface RefObject<T> {
    readonly current: T | null;
  }

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key;
  }

  interface ReactPortal {
    key: Key;
    children: ReactNode;
  }

  interface JSXElementConstructor<P> {
    (props: P): ReactElement<any, any> | null;
  }

  interface FunctionComponent<P = Record<string, unknown>> {
    (props: P & { children?: ReactNode }): ReactElement<any, any> | null;
    displayName?: string;
  }

  type FC<P = Record<string, unknown>> = FunctionComponent<P>;
  type ComponentType<P = Record<string, unknown>> = FunctionComponent<P>;
  type ComponentProps<T extends ComponentType<any>> = T extends ComponentType<infer P> ? P : never;

  interface Context<T> {
    Provider: FunctionComponent<{ value: T; children?: ReactNode }>;
    Consumer: FunctionComponent<{ children?: (value: T) => ReactNode }>;
    _currentValue: T;
  }

  interface HTMLAttributes<T> extends Record<string, unknown> {
    className?: string;
    style?: Record<string, string | number>;
    id?: string;
  }

  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string;
    rel?: string;
    target?: string;
  }

  interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
    async?: boolean;
    defer?: boolean;
    src?: string;
    type?: string;
    nonce?: string;
  }

  interface DetailedHTMLProps<E extends HTMLAttributes<T>, T> extends E {
    ref?: RefObject<T> | ((instance: T | null) => void) | null;
  }

  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
  }

  const Fragment: FunctionComponent<{ children?: ReactNode }>;
  const Suspense: FunctionComponent<{ children?: ReactNode }>;

  function createElement(type: any, props?: any, ...children: ReactNode[]): ReactElement;
  function createContext<T>(defaultValue: T): Context<T>;
  function useContext<T>(context: Context<T>): T;
  function useState<S>(initial: S): [S, (value: S | ((previous: S) => S)) => void];
  function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  function useLayoutEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly unknown[]): T;
  function useRef<T>(initial: T | null): RefObject<T>;
  function useId(): string;
  function useTransition(): [boolean, (callback: () => void) => void];
  function startTransition(callback: () => void): void;
  function useDeferredValue<T>(value: T): T;
  function memo<T extends ComponentType<any>>(component: T): T;
  function forwardRef<T, P = Record<string, unknown>>(render: (props: P, ref: T | null) => ReactElement | null): ComponentType<P>;
  function cache<T extends (...args: any[]) => Promise<unknown>>(fn: T): T;
}

declare module "react" {
  export = React;
}

declare namespace JSX {
  type Element = React.ReactElement;
  interface ElementClass {
    render: unknown;
  }
  interface ElementChildrenAttribute {
    children: {};
  }
  interface IntrinsicAttributes extends React.Attributes {}
  interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
