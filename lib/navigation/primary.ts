export interface NavItem {
  label: string;
  href: string;
  description?: string;
  isExternal?: boolean;
}

export const primaryNavigation: readonly NavItem[] = [
  {
    label: "Journal",
    href: "/blog",
    description: "Latest stories and editorial features.",
  },
  {
    label: "Rituals",
    href: "/journal",
    description: "Foundational guides for holistic living.",
  },
  {
    label: "Recipes",
    href: "/recipes",
    description: "Seasonal nourishment and functional food.",
  },
  {
    label: "Shop",
    href: "/shop",
    description: "Tools, checklists, and wellness kits.",
  },
  {
    label: "About",
    href: "/about",
    description: "Meet the team and our philosophy.",
  },
] as const;

export const footerNavigation: readonly NavItem[] = [
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Disclosure", href: "/disclosure" },
  { label: "Search", href: "/search" },
];
