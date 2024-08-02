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

interface BaseFormResponse<T extends string, D = undefined> {
  status: T;
  message: string;
  data?: D;
}

type SuccessFormResponse<D = undefined> = BaseFormResponse<"success", D>;

type ErrorFormResponse<D = undefined> = BaseFormResponse<"error", D> & {
  errors?: {
    path: string;
    message: string;
  }[];
};

export type FormResponse<D = undefined> =
  | SuccessFormResponse<D>
  | ErrorFormResponse<D>
  | null;

export type FormState = {
  message: string;
  status: "success" | "error";
  errors?: {
    path: string;
    message: string;
  }[];
} | null;
