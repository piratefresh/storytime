import { XIcon } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { TabsTrigger } from "../ui/tabs";
import { type Tab } from "./file-tabs";

interface FileTabProps {
  tab: Tab;
  onClose: () => void;
}

export function FileTab({ tab, onClose }: FileTabProps): JSX.Element {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <TabsTrigger
          className="group hover:pr-1 flex flex-row items-center"
          value={tab.id.toString()}
        >
          {tab.label}
          <XIcon
            onClick={onClose}
            className="hidden group-hover:block w-4 h-4"
          />
        </TabsTrigger>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onClose}>Close</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
