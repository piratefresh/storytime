"use client";

import { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Edge,
  EdgeTypes,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  OnConnect,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import FloatingEdge from "./floating-edge";
import FloatingConnectionLine from "./floating-connection-line";
import { StoryWithFolder } from "@/app/(main)/stories/[title]/page";

interface FlowProps {
  story: StoryWithFolder;
}

const edgeTypes: EdgeTypes = {
  floating: FloatingEdge,
};

function generateReactFlowData(story: StoryWithFolder): {
  nodes: Node[];
  edges: Edge[];
} {
  const topNode = {
    id: `story-${story?.id}`,
    type: "textUpdater",
    data: { label: story?.title },
    position: { x: 500, y: 50 }, // Top center position
  };
  if (!story.folder) return { nodes: [topNode], edges: [] };
  let nodes: Node[] = [topNode]; // Include the top node
  let edges: Edge[] = []; // Initialize edges array
  let levelMap = { [`story-${story?.id}`]: 0 }; // Level map to track node levels

  // Add folders to nodes with a placeholder for position
  story.folder.forEach((folder) => {
    nodes.push({
      id: folder.id,
      type: "textUpdater",
      data: { label: folder.name },
      position: { x: 0, y: 0 }, // Position will be set later based on levels
    });

    // Establish level for each node
    const parentId = folder.parentId || `story-${story?.id}`; // Default to top node if parentId is null
    const parentLevel = levelMap[parentId] || 0;
    levelMap[folder.id] = parentLevel + 1;

    // Create edge to parent or to the top node if no parent
    const sourceId = folder.parentId || `story-${story?.id}`;
    edges.push({
      id: `e-${sourceId}-${folder.id}`,
      source: sourceId,
      target: folder.id,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#fff" },
    });
  });

  // Calculate positions based on levels
  const maxLevelWidth = 800; // Maximum width allowed for nodes
  Object.keys(levelMap).forEach((level) => {
    const nodesAtLevel = nodes.filter(
      (n) => levelMap[n.id] === parseInt(level)
    );
    const levelWidth = maxLevelWidth / (nodesAtLevel.length + 1);
    nodesAtLevel.forEach((node, index) => {
      node.position = {
        x: levelWidth * (index + 1),
        y: 150 + parseInt(level) * 100,
      };
    });
  });

  return { nodes, edges };
}

const nodeTypes = { textUpdater: TextUpdaterNode };

function Flow({ story }: FlowProps) {
  const { nodes: initialNodes, edges: initialEdges } =
    generateReactFlowData(story);
  console.log("initialNodes", initialNodes);
  console.log("initialEdges", initialEdges);
  const [nodes, , onNodesChange] = useNodesState<Node[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
            markerEnd: { type: MarkerType.Arrow },
          },
          eds
        )
      ),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      edgeTypes={edgeTypes}
      connectionLineComponent={FloatingConnectionLine}
      className="border"
      nodeTypes={nodeTypes}
    />
  );
}

export default Flow;

function TextUpdaterNode({ data, isConnectable }: NodeProps) {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex">
        <div className="ml-2">
          <div className="text-lg text-primary-foreground font-bold">
            {data.label}
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
