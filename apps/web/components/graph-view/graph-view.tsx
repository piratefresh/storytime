"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  type Edge,
  type EdgeTypes,
  MarkerType,
  MiniMap,
  type Node,
  type OnConnect,
  useEdgesState,
  useNodesState,
} from "reactflow";
import Dagre from "@dagrejs/dagre";
import "reactflow/dist/style.css";
import { type StoryWithFolder } from "@/app/(main)/stories/[title]/page";
import FloatingEdge from "./floating-edge";
import FloatingConnectionLine from "./floating-connection-line";
import ContextMenu, { type ContextMenuProps } from "./context-menu";
import { FileNode, FolderNode } from "./nodes";

interface FlowProps {
  id: string;
  story: StoryWithFolder;
  onAddFolder: (folderId: string) => Promise<void>;
  onAddFile: (parentId: string) => Promise<void>;
}

const edgeTypes: EdgeTypes = {
  floating: FloatingEdge,
};

function generateReactFlowData(story: StoryWithFolder): {
  nodes: Node[];
  edges: Edge[];
} {
  console.log("story: ", story);
  const topNode = {
    id: `story-${story.id}`,
    type: "folder",
    data: { label: story.title, id: story.id, type: "story" },
    position: { x: 0, y: 0 }, // Top center position
  };
  if (!story.folder) return { nodes: [topNode], edges: [] };
  const nodes: Node[] = [topNode]; // Include the top node
  const edges: Edge[] = []; // Initialize edges array
  const levelMap = { [`story-${story.id}`]: 0 }; // Level map to track node levels

  // Add folders to nodes with a placeholder for position
  story.folder.forEach((folder) => {
    folder.file.forEach((file) => {
      nodes.push({
        id: file.id,
        type: "file",
        data: {
          label: file.name,
          folderId: folder.id,
          id: file.id,
          type: "file",
        },
        position: { x: 0, y: 0 },
      });

      edges.push({
        id: `e-${folder.id}-${file.id}`,
        source: folder.id,
        target: file.id,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#fff" },
      });
    });

    nodes.push({
      id: folder.id,
      type: "folder",
      data: {
        label: folder.name,
        parentId: folder.parentId,
        id: folder.id,
        type: "folder",
      },
      position: { x: 0, y: 0 },
    });

    // Establish level for each node
    const parentId = folder.parentId ?? `story-${story.id}`; // Default to top node if parentId is null
    const parentLevel = levelMap[parentId] ?? 0;
    levelMap[folder.id] = parentLevel + 1;

    // Create edge to parent or to the top node if no parent
    const sourceId = folder.parentId ?? `story-${story.id}`;
    edges.push({
      id: `e-${sourceId}-${folder.id}`,
      source: sourceId,
      target: folder.id,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#fff" },
    });
  });

  return { nodes, edges };
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { direction: "TB" | "LR" }
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: options.direction,
    nodesep: 200, // Increase this value for more horizontal space
    ranksep: 200, // Increase this value for more vertical space
    edgesep: 10,
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const nodeTypes = {
  file: FileNode,
  folder: FolderNode,
};

function Flow({ id, story, onAddFolder, onAddFile }: FlowProps): JSX.Element {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const { nodes, edges } = generateReactFlowData(story);
    return getLayoutedElements(nodes, edges, { direction: "TB" });
  }, [story]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = useState<ContextMenuProps | null>(null);
  const ref = useRef(null);

  console.log("nodes: ", nodes);

  const onConnect: OnConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "floating",
            markerEnd: { type: MarkerType.Arrow },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = ref.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX,
        right: pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
        open: true,
        onAddFolder,
        onAddFile,
        data: node.data,
      });
    },
    [onAddFile, onAddFolder]
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
  }, [setMenu]);

  return (
    <ReactFlow
      id={id}
      ref={ref}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
      fitView
      edgeTypes={edgeTypes}
      connectionLineComponent={FloatingConnectionLine}
      className="border absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"
      nodeTypes={nodeTypes}
    >
      {menu ? <ContextMenu onClick={onPaneClick} {...menu} /> : null}
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}

export default Flow;
