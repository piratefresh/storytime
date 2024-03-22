"use client";

import { CMDK } from "@/components/cmdk";
import { Nav } from "@/components/nav/nav";

import { Separator } from "@/components/ui/separator";
import { Archive, Atom, File, FolderOpen, Globe, Home } from "lucide-react";
import { useState } from "react";

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="flex flex-row min-h-full h-full w-full overflow-hidden">
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Stories",
            label: "9",
            icon: FolderOpen,
            variant: "ghost",
            href: "/",
          },
          {
            title: "Assets",
            label: "",
            icon: Atom,
            variant: "ghost",
            href: "/",
          },
          {
            title: "Community",
            label: "",
            icon: Globe,
            variant: "ghost",
            href: "/",
          },
        ]}
      />
      <CMDK />
      <main className="flex flex-1 justify-center px-6 py-8">{children}</main>
    </div>
  );
}
