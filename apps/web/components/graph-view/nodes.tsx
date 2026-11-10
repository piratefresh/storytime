import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

type LabelNode = Node<{ label: string }>;

export function FileNode({ data }: NodeProps<LabelNode>): React.JSX.Element {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex">
        <div className="ml-2">
          <div className="text-lg text-primary-foreground font-bold">
            📄 {data.label}
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}

export function FolderNode({ data }: NodeProps<LabelNode>): React.JSX.Element {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex">
        <div className="ml-2">
          <div className="text-lg text-primary-foreground font-bold">
            📁 {data.label}
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}
