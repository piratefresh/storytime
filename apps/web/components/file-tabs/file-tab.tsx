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
        <TabsTrigger value={tab.id.toString()}>{tab.label}</TabsTrigger>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onClose}>Close</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
