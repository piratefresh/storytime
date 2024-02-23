import { LucideIcon } from "lucide-react";

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
};

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

export type SidebarNavItem = {
  title: string;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  icon: LucideIcon;
  variant?: "default" | "ghost";
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items?: NavLink[];
    }
);

export type DocsConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};
