import React from "react";
import { FileHandler } from "@tiptap-pro/extension-file-handler";
import {
  NodeViewWrapper,
  NodeViewWrapperProps,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import { cn } from "@/lib/utils";

interface ResizerProps {
  onResize: (direction: string, x: number, y: number) => void;
  selected: boolean;
}

export const Direction = {
  Top: "top",
  TopLeft: "topLeft",
  TopRight: "topRight",
  Right: "right",
  Bottom: "bottom",
  BottomLeft: "bottomLeft",
  BottomRight: "bottomRight",
  Left: "left",
};

export const Resizer = ({ onResize, selected }: ResizerProps) => {
  const [direction, setDirection] = React.useState("");
  const [mouseDown, setMouseDown] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!direction) return;

      const ratio = window.devicePixelRatio;

      onResize(direction, e.movementX / ratio, e.movementY / ratio);
    };

    if (mouseDown) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseDown, direction, onResize]);

  React.useEffect(() => {
    const handleMouseUp = () => setMouseDown(false);

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (direction: string) => {
    setDirection(direction);
    setMouseDown(true);
  };
  if (!selected) return <></>;
  return (
    <>
      <div
        className="absolute cursor-nw-resize h-2.5 w-2.5 z-20 top-0 left-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => {
          handleMouseDown(Direction.TopLeft);
        }}
      ></div>

      <div
        className="absolute cursor-nesw-resize h-2.5 w-2.5 z-20 top-0 right-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => handleMouseDown(Direction.TopRight)}
      ></div>

      <div
        className="absolute cursor-nwse-resize w-2.5 h-2.5 z-20 right-0 bottom-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => handleMouseDown(Direction.BottomRight)}
      ></div>

      <div
        className="absolute cursor-nesw-resize h-2.5 w-2.5 z-20 left-0 bottom-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => handleMouseDown(Direction.BottomLeft)}
      ></div>
    </>
  );
};

export const Component = (props: NodeViewWrapperProps) => {
  const imageRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    // Convert Base64 string to a Blob
    const fetchImageDimensions = async () => {
      const response = await fetch(props.node?.attrs.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Load the image and extract dimensions
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url); // Clean up the blob URL
      };
      img.src = url;
    };

    fetchImageDimensions();
  }, [props.node?.attrs.src]);

  const handleAspectRatio = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const image = imageRef.current;
  };

  const handleResize = (
    direction: string,
    movementX: number,
    movementY: number
  ) => {
    const pos = props.getPos();
    props.editor.commands.setNodeSelection(pos);
    const panel = imageRef.current;

    if (!panel) return;

    const { width, height, x, y } = panel.getBoundingClientRect();
    const resizeTop = () => {
      const newHeight = height - movementY;
      props.updateAttributes({ height: newHeight });
    };

    const resizeLeft = () => {
      const newWidth = width - movementX;
      props.updateAttributes({ width: newWidth });
    };

    const resizeRight = () => {
      const newWidth = width + movementX;
      props.updateAttributes({ width: newWidth });
    };

    const resizeBottom = () => {
      const newHeight = height + movementY;
      props.updateAttributes({ height: newHeight });
    };

    switch (direction) {
      case Direction.TopLeft:
        resizeTop();
        resizeLeft();
        break;
      case Direction.TopRight:
        resizeTop();
        resizeRight();
        break;
      case Direction.BottomRight:
        resizeBottom();
        resizeRight();
        break;
      case Direction.BottomLeft:
        resizeBottom();
        resizeLeft();
        break;

      default:
        break;
    }
  };

  return (
    <NodeViewWrapper
      as="figure"
      className="relative inline-block"
      style={{ float: props.node?.attrs.float ?? "none" }}
      height={props.node?.attrs.height}
      width={props.node?.attrs.width}
    >
      <Resizer onResize={handleResize} selected={props.selected} />

      <img
        className={cn({ "border-2 border-blue-500 z-10": props.selected })}
        ref={imageRef}
        src={props.node?.attrs.src}
        height={props.node?.attrs.height}
        width={props.node?.attrs.width}
        draggable={true}
        data-drag-handle
        onLoad={(e) => handleAspectRatio(e)}
        // alt="uploaded image"
      />
    </NodeViewWrapper>
  );
};

const CustomFileHandler = FileHandler.extend({
  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});
