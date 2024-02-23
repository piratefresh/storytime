import React from "react";
import { cn } from "@/lib/utils";
import TiptapImage from "@tiptap/extension-image";
import { Plugin } from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewWrapperProps,
} from "@tiptap/react";

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

interface IResizer {
  onResize: (direction: string, x: number, y: number) => void;
  selected: boolean;
}

export const Resizer = ({ onResize, selected }: IResizer) => {
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
  const [aspectRatio, setAspectRatio] = React.useState(0);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    // Convert Base64 string to a Blob
    const fetchImageDimensions = async () => {
      const response = await fetch(props.node?.attrs.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Load the image and extract dimensions
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
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
    if (!image) return;
    setAspectRatio(image.naturalWidth / image.naturalHeight);
  };

  const handleResize = (direction, movementX, movementY) => {
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

export default TiptapImage.extend({
  // defaultOptions: {
  //   ...TiptapImage.options,
  //   sizes: ["inline", "block", "left", "right"],
  // },
  selectable: true,
  // group: "block",
  draggable: true,
  addAttributes() {
    return {
      // Inherit all the attrs of the Image extension
      ...this.parent?.(),

      // New attrs
      width: {
        default: "100%",
        // tell them to render on the img tag
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },

      height: {
        default: "auto",
        renderHTML: (attributes) => {
          return {
            height: attributes.height,
          };
        },
      },

      // We'll use this to tell if we are going to drag the image
      // through the editor or if we are resizing it
      isDraggable: {
        default: true,
        // We don't want it to render on the img tag
        renderHTML: (attributes) => {
          return {};
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
  onFocus({ event }) {},
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop(view: EditorView, event: DragEvent) {
              const hasFiles =
                event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length;

              if (!hasFiles) {
                return false; // Indicate that the event was not handled
              }

              const images = Array.from(event.dataTransfer.files).filter(
                (file) => /image/i.test(file.type)
              );

              if (images.length === 0) {
                return false; // Indicate that the event was not handled
              }

              event.preventDefault();

              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (!coordinates) {
                return false; // Early exit if coordinates are null
              }

              images.forEach((image) => {
                const reader = new FileReader();

                reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
                  // Using null assertion for target.result since we've already ensured the file is an image
                  const imgSrc = readerEvent.target?.result;
                  if (typeof imgSrc === "string") {
                    const imageNode = schema.nodes.image?.create({
                      src: imgSrc,
                    });
                    if (imageNode) {
                      const transaction = view.state.tr.insert(
                        coordinates.pos,
                        imageNode
                      );
                      view.dispatch(transaction);
                    }
                  }
                };
                reader.readAsDataURL(image);
              });

              return true; // Indicate that the event was handled
            },
            paste(view: EditorView, event: ClipboardEvent) {
              const hasFiles =
                event.clipboardData &&
                event.clipboardData.files &&
                event.clipboardData.files.length;

              if (!hasFiles) {
                return false; // Indicate that the event was not handled
              }

              const images = Array.from(event.clipboardData.files).filter(
                (file) => /image/i.test(file.type)
              );

              if (images.length === 0) {
                return false; // Indicate that the event was not handled
              }

              event.preventDefault();

              const { schema } = view.state;

              images.forEach((image) => {
                const reader = new FileReader();

                reader.onload = (readerEvent: ProgressEvent<FileReader>) => {
                  const imgSrc = readerEvent.target?.result;
                  if (typeof imgSrc === "string") {
                    const imageNode = schema.nodes.image?.create({
                      src: imgSrc,
                    });
                    if (imageNode) {
                      const transaction =
                        view.state.tr.replaceSelectionWith(imageNode);
                      view.dispatch(transaction);
                    }
                  }
                };
                reader.readAsDataURL(image);
              });

              return true; // Indicate that the event was handled
            },
          },
        },
      }),
    ];
  },
});
