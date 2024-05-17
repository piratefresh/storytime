import React from "react";
import { cn } from "@/lib/utils";
import TiptapImage, { ImageOptions } from "@tiptap/extension-image";
import { Plugin, PluginKey } from "@tiptap/pm/state";
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

type UploadResult = {
  url: string | null;
  bucket: string;
  key: string;
  name?: string;
  size?: number;
};

type CustomImageOptions = ImageOptions & {
  uploadImage: (file: File) => Promise<UploadResult>;
  maxFileSize: number;
  accept: string[];
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
};

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

export const KB = 1024 as const;

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes <= 0) return "0 Bytes";

  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(KB));

  return (
    parseFloat((bytes / Math.pow(KB, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

export const CustomImage = TiptapImage.extend<CustomImageOptions>({
  selectable: true,
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

  addOptions() {
    return {
      ...this.parent?.(),
    };
  },
  addProseMirrorPlugins() {
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
                    return view.dispatch(transaction);
                  };
                })
                .catch(() =>
                  window.alert(`Failed to upload image. Please try again`)
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
                .then((url) => {
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
                    const transaction =
                      view.state.tr.replaceSelectionWith(image);
                    return view.dispatch(transaction);
                  };
                })
                .catch(() =>
                  window.alert(`Failed to upload image. Please try again`)
                );
            }

            return true;
          },
        },
      }),
    ];
  },
});

export default CustomImage;
