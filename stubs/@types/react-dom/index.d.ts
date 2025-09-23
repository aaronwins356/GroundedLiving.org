import type { ReactNode } from "react";

declare namespace ReactDOM {
  function render(element: ReactNode, container: Element | DocumentFragment | null): void;
  function hydrate(element: ReactNode, container: Element | DocumentFragment | null): void;
  function createPortal(children: ReactNode, container: Element | DocumentFragment): ReactNode;
}

declare module "react-dom" {
  export = ReactDOM;
}
