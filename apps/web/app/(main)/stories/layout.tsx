"use client";

import { CMDK } from "@/components/cmdk";

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex flex-row min-h-full h-full w-full overflow-hidden">
      <CMDK />
      <main className="flex flex-1 justify-center">{children}</main>
    </div>
  );
}
