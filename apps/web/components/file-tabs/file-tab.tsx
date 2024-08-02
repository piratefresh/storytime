import { XIcon } from "lucide-react";
import { type Tab } from "@/app/stores/tabs-store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

interface FileTabProps {
  active: boolean;
  tab: Tab;
  onClose: () => void;
}

export function FileTab({
  active = false,
  tab,
  onClose,
}: FileTabProps): JSX.Element {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <TabsTrigger
          className={cn("group hover:pr-1 flex flex-row items-center", {
            "border-blue-500": active,
          })}
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
