import React from "react";
import TiptapImage, { type ImageOptions } from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { cn } from "@/lib/utils";

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

// setImageBlockAlign / setImageBlockWidth are declared in image-block/image-block.ts
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageFloat: {
      setImageBlockFloat: (float: "left" | "right" | "none") => ReturnType;
    };
  }
}

interface ResizerProps {
  onResize: (direction: string, x: number, y: number) => void;
  selected: boolean;
}

interface UploadResult {
  url: string | null;
  bucket: string;
  key: string;
  name?: string;
  size?: number;
}

type CustomImageOptions = ImageOptions & {
  uploadImage: (file: File) => Promise<UploadResult>;
  maxFileSize: number;
  accept: string[];
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
};

export function Resizer({ onResize, selected }: ResizerProps) {
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
    const handleMouseUp = () => { setMouseDown(false); };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (newDirection: string) => {
    setDirection(newDirection);
    setMouseDown(true);
  };
  if (!selected) return null;
  return (
    <>
      <div
        role="presentation"
        className="absolute cursor-nw-resize h-2.5 w-2.5 z-20 top-0 left-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => {
          handleMouseDown(Direction.TopLeft);
        }}
       />

      <div
        role="presentation"
        className="absolute cursor-nesw-resize h-2.5 w-2.5 z-20 top-0 right-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => { handleMouseDown(Direction.TopRight); }}
       />

      <div
        role="presentation"
        className="absolute cursor-nwse-resize w-2.5 h-2.5 z-20 right-0 bottom-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => { handleMouseDown(Direction.BottomRight); }}
       />

      <div
        role="presentation"
        className="absolute cursor-nesw-resize h-2.5 w-2.5 z-20 left-0 bottom-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => { handleMouseDown(Direction.BottomLeft); }}
       />
    </>
  );
}

interface ImageAttrs {
  src?: string;
  width?: string | number;
  height?: string | number;
  align?: string;
  float?: React.CSSProperties["float"];
}

export function Component(props: NodeViewProps) {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const attrs = props.node.attrs as ImageAttrs;

  const handleResize = (
    direction: string,
    movementX: number,
    movementY: number
  ) => {
    const pos = props.getPos();
    props.editor.commands.setNodeSelection(pos);
    const panel = imageRef.current;

    if (!panel) return;

    const { width, height } = panel.getBoundingClientRect();
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
  console.log("attrs: ", props.node);
  return (
    <NodeViewWrapper
      as="figure"
      className={cn("relative flex node-imageBlock", {
        "has-focus": props.selected,
        "mr-auto": attrs.align === "left",
        "mx-auto": attrs.align === "center",
        "ml-auto": attrs.align === "right",
      })}
      style={{ float: attrs.float ?? "none" }}
      height={attrs.height}
      width={attrs.width}
    >
      <Resizer onResize={handleResize} selected={props.selected} />

      {/* eslint-disable-next-line @next/next/no-img-element -- editor node view renders arbitrary user-supplied image URLs; next/image needs known remote hosts */}
      <img
        className={cn({
          "border-2 border-blue-500 z-10": props.selected,
        })}
        ref={imageRef}
        src={attrs.src}
        height={attrs.height}
        width={attrs.width}
        draggable
        data-drag-handle
        alt=""
      />
    </NodeViewWrapper>
  );
}

export const KB = 1024;

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes <= 0) return "0 Bytes";

  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(KB));

  return (
    `${String(parseFloat((bytes / Math.pow(KB, i)).toFixed(decimals)))} ${String(sizes[i])}`
  );
}

export const CustomImage = TiptapImage.extend<CustomImageOptions>({
  name: "imageBlock",
  selectable: true,
  draggable: true,
  addCommands() {
    return {
      setImageBlockAlign:
        (align) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", { align }),
      setImageBlockWidth:
        (width) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", {
            width: `${String(Math.max(0, Math.min(100, width)))}%`,
          }),
      setImageBlockFloat:
        (float) =>
        ({ commands }) =>
          commands.updateAttributes("imageBlock", { float }),
    };
  },
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
            width: attributes.width as string | number,
          };
        },
      },
      height: {
        default: "auto",
        renderHTML: (attributes) => {
          return {
            height: attributes.height as string | number,
          };
        },
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => {
          console.log("attributes: ", attributes);
          return {
            "data-align": attributes.align as string,
          };
        },
      },
      float: {
        default: "none",
        parseHTML: (element) => element.getAttribute("data-float"),
        renderHTML: (attributes) => {
          console.log("attributes: ", attributes);
          return {
            "data-float": attributes.float as string,
          };
        },
      },
      alt: {
        default: undefined,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => ({
          alt: attributes.alt as string | undefined,
        }),
      },

      // We'll use this to tell if we are going to drag the image
      // through the editor or if we are resizing it
      isDraggable: {
        default: true,
        // We don't want it to render on the img tag
        renderHTML: () => {
          return {};
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component, {
      className: cn("flex"),
      // attrs
    });
  },

  addOptions() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typed as always set, but undefined at runtime with @tiptap/extension-image 2.2.3
      ...this.parent?.(),
    };
  },
  addProseMirrorPlugins() {
    /* eslint-disable no-alert -- prototype upload feedback; no toast system is wired into this extension yet */
    return [
      new Plugin({
        key: new PluginKey("imageUpload"),
        props: {
          handlePaste: (view, event) => {
            const items = event.clipboardData?.items;
            if (!items) return false;

            for (const item of items) {
              if (!this.options.accept.includes(item.type)) return false;

              const file = item.getAsFile();
              if (!file) return false;
              if (file.size > this.options.maxFileSize) {
                window.alert(
                  `File is too big. Max file size is ${formatBytes(this.options.maxFileSize)}`
                );
                return false;
              }

              this.options.onUploadStart?.();
              this.options
                .uploadImage(file)
                .then(({ url }) => {
                  this.options.onUploadEnd?.();

                  if (!url) {
                    console.error("URL not returned from S3.");
                    return false;
                  }
                  // pre-load image
                  const src = url;
                  const img = new Image();
                  img.src = src;
                  img.onload = () => {
                    const { schema } = view.state;
                    const imageNode = schema.nodes.image;
                    if (!imageNode) {
                      console.error(
                        "Image node type is not defined in the schema."
                      );
                      return false;
                    }
                    const image = imageNode.create({ src });
                    const transaction =
                      view.state.tr.replaceSelectionWith(image);
                    view.dispatch(transaction);
                  };
                })
                .catch(() =>
                  { window.alert(`Failed to upload image. Please try again`); }
                );
            }

            return true;
          },
          handleDrop: (view, event) => {
            const files = event.dataTransfer?.files;
            if (!files) return false;

            for (const file of files) {
              if (!file.type.startsWith("image")) continue;
              // first just make sure in our code that we're only allowing the file types we want
              if (!this.options.accept.includes(file.type)) {
                console.log(
                  `Unsupported file type. Supported types: ${this.options.accept.join(", ")}`
                );
                return false;
              }

              if (file.size > this.options.maxFileSize) {
                window.alert(
                  `File is too big. Max file size is ${formatBytes(this.options.maxFileSize)}`
                );
                return false;
              }

              this.options.onUploadStart?.();
              console.log("file: ", file);
              this.options
                .uploadImage(file)
                .then((url: UploadResult | null) => {
                  console.log("url: ", url);
                  this.options.onUploadEnd?.();
                  // pre-load image

                  const img = new Image();
                  if (!url) {
                    console.error("URL not returned from S3.");
                    return false;
                  }
                  const src = url;
                  img.src = src as unknown as string;
                  img.onload = () => {
                    const { schema } = view.state;
                    const imageNode = schema.nodes.image;
                    if (!imageNode) {
                      console.error(
                        "Image node type is not defined in the schema."
                      );
                      return false;
                    }
                    const image = imageNode.create({ src });

                    console.log(image); // Check the output here

                    const transaction =
                      view.state.tr.replaceSelectionWith(image);
                    if (
                      typeof view.state.tr.replaceSelectionWith !== "function"
                    ) {
                      console.error("replaceSelectionWith is not a function");
                      return false;
                    }
                    console.log("transaction", transaction);
                    view.dispatch(transaction);
                  };
                })
                .catch(() =>
                  { window.alert(`Failed to upload image. Please try again`); }
                );
            }

            return true;
          },
        },
      }),
    ];
    /* eslint-enable no-alert -- end of upload plugin */
  },
});

export default CustomImage;
