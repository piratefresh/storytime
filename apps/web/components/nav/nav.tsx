"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarNavItem } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { TypographyH1 } from "../ui/typography";
import { UserInfo } from "./user-info";
import { useSession } from "../session-provider";

interface NavProps {
  isCollapsed: boolean;
  links: SidebarNavItem[];
}

function NavItems({ items }: { items: SidebarNavItem[] }) {
  if (!items) return null;
  return items.map((link) => (
    <div className="pl-4" key={link.href}>
      <Link href={link.href as string}>{link.title}</Link>
      {/* Check if the current link has nested items and recursively render them */}
      {link.items && (
        <div className="pl-4">
          {/* Adjust the padding as needed for nested items */}
          {link.items ? <NavItems items={link.items} /> : null}
        </div>
      )}
    </div>
  ));
}

export function Nav({ links, isCollapsed }: NavProps) {
  const { user } = useSession();
  console.log(user);
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2 min-h-screen min-w-[220px] border-r"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        <div className="inline-flex flex-col items-start gap-8">
          <TypographyH1>Storytime</TypographyH1>
          <DropdownMenu>
            <DropdownMenuTrigger>{user.email}</DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-4">
          {links.map((link, index) => (
            <Collapsible key={`${link.href}-${index}`}>
              <Link href={link.href as string}>
                <div className="flex items-center gap-4">
                  <link.icon className="h-6 w-6" />
                  <span>{link.title}</span>
                </div>
              </Link>
              {link.items ? (
                <>
                  <CollapsibleTrigger>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 items-center"
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {link.items ? <NavItems items={link.items} /> : null}
                  </CollapsibleContent>
                </>
              ) : null}
            </Collapsible>
          ))}
        </div>
      </nav>
    </div>
  );
}
