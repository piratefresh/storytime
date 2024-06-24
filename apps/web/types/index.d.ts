import { LucideIcon } from "lucide-react";

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
}

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

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

export interface DocsConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export type FormResponse =
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
      errors?: {
        path: string;
        message: string;
      }[];
    }
  | null;

export type FormState = {
  message: string;
  status: "success" | "error";
  errors?: {
    path: string;
    message: string;
  }[];
} | null;
