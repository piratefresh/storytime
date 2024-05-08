import React from "react";
import TreeViewPrimitive, {
  EventCallback,
  flattenTree,
  IBranchProps,
  INode,
  LeafProps,
} from "react-accessible-treeview";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { get } from "http";
import { IFlatMetadata } from "react-accessible-treeview/dist/TreeView/utils";

export interface Folder {
  name: string;
  children?: Folder[];
}

interface ContextMenuItems {
  label: string;
  onClick: (info: any) => void;
}

export interface TreeViewProps extends React.ComponentPropsWithoutRef<"div"> {
  folder: Folder;
  contextMenuItems: ContextMenuItems[];
  onDoubleClick: (info: any) => void;
}

const TreeNode = ({
  getNodeProps,
  element,
  contextMenuItems,
  level,
  isExpanded,
  isBranch,
  handleDoubleClick,
}: {
  getNodeProps: (args?: {
    onClick?: EventCallback;
  }) => IBranchProps | LeafProps;
  element: INode<IFlatMetadata>;
  contextMenuItems?: ContextMenuItems[];
  level: number;
  isExpanded?: boolean;
  isBranch?: boolean;
  handleDoubleClick?: (info: any) => void;
}) => {
  const [renaming, setRenaming] = React.useState(false);

  const defaultNode = (
    <div
      {...getNodeProps({
        onClick: renaming
          ? () => {
              handleDoubleClick?.(element);
            }
          : getNodeProps().onClick,
      })}
      onDoubleClick={() => setRenaming(true)}
      className={cn(
        "relative",
        "transition-colors",
        "flex items-center gap-3",
        "text-sm",
        "cursor-pointer",
        "select-none",
        "text-foreground-light",
        "aria-selected:text-foreground",
        "aria-expanded:bg-control",
        "aria-selected:!bg-selection",
        "group",
        "h-[28px]",
        "hover:bg-control"
      )}
      style={{
        marginLeft: 20 * (level - 1),
        paddingLeft: !isBranch ? 25 : 0,
      }}
    >
      {isExpanded && (
        <div className="absolute h-full w-px border-l top-[25px] left-[14px]"></div>
      )}
      <div className="absolute left-0 h-full w-0.5 group-aria-selected:bg-foreground"></div>
      {isBranch && <ArrowIcon isOpen={isExpanded as boolean} />}
      {renaming ? (
        <Input
          defaultValue={element.name}
          onBlur={() => setRenaming(false)}
          autoFocus
        />
      ) : (
        element.name
      )}
    </div>
  );

  return contextMenuItems ? (
    <ContextMenu>
      <ContextMenuTrigger>{defaultNode}</ContextMenuTrigger>
      <ContextMenuContent>
        {contextMenuItems.map((item) => (
          <ContextMenuItem onClick={() => item.onClick(element)}>
            {item.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  ) : (
    defaultNode
  );
};

const TreeView = React.forwardRef<HTMLDivElement, TreeViewProps>(
  ({ folder, contextMenuItems, onDoubleClick, ...props }, ref) => {
    const data = flattenTree(folder);

    return (
      <TreeViewPrimitive
        data={data}
        className="basic"
        aria-label="Tree view List"
        nodeRenderer={({
          getNodeProps,
          element,
          level,
          isExpanded,
          isBranch,
          isDisabled,
          onDoubleClick,
        }) => (
          <TreeNode
            element={element}
            contextMenuItems={contextMenuItems}
            level={level}
            isExpanded={isExpanded}
            isBranch={isBranch}
            getNodeProps={getNodeProps}
            onDoubleClick={onDoubleClick}
          />
        )}
      />
    );
  }
);

const ArrowIcon = ({
  isOpen,
  className,
}: {
  isOpen: boolean;
  className?: string;
}) => (isOpen ? <ChevronDown /> : <ChevronRight />);

export { TreeView };
