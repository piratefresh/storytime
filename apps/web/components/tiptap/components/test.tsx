"use client";

import { BlockEditor } from "@/components/block-editor/block-editor";

export function TestEditor(): JSX.Element {
  return (
    <div className="relative flex flex-col flex-1 min-h-screen overflow-hidden">
      <BlockEditor
        user={null}
        onChange={(content: string) => {
          console.log("Change Detected:", content);
        }}
        content=""
      />
    </div>
  );
}
