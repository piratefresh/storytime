import { type User } from "lucia";
import { BlockEditor } from "../block-editor/block-editor";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { type Tab } from "./file-tabs";

interface FileTabContentProps {
  user: User;
  tab: Tab;
}

export function fileTabContent({
  user,
  tab,
}: FileTabContentProps): JSX.Element {
  return (
    <div>
      <div className="grid align-end flex-1 min-h-screen max-h-screen overflow-y-auto">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>
            <BlockEditor
              user={user}
              onChange={(content: string) => {
                console.log("Change Detected:", content);
              }}
              content={tab.content || ""}
              contentId={tab.id}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <Flow story={story} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
