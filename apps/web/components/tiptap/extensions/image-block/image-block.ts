import { ReactNodeViewRenderer } from "@tiptap/react";
import { mergeAttributes, type Range } from "@tiptap/core";
import TiptapImage from "@tiptap/extension-image";
import ImageBlockView from "./components/image-block-view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string }) => ReturnType;
      setImageBlockAt: (attributes: {
        src: string;
        pos: number | Range;
      }) => ReturnType;
      setImageBlockAlign: (align: "left" | "center" | "right") => ReturnType;
      setImageBlockWidth: (width: number) => ReturnType;
    };
  }
}

export const ImageBlock = TiptapImage.extend({
  name: "imageBlock",

  group: "block",

  defining: true,

  isolating: true,

  inline: false, // Add this line to make it a block-level node

  selectable: true, // Add this line to make it selectable

  atom: true, // Add this line to make it an atomic node

  draggable: true, // Add this line to make it draggable

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: "",
        parseHTML: (element) => {
          return element.getAttribute("src");
        },
        renderHTML: (attributes) => {
          return { src: attributes.src as string };
        },
      },
      width: {
        default: "100%",
        parseHTML: (element) => {
          return element.getAttribute("data-width");
        },
        renderHTML: (attributes) => {
          return { "data-width": attributes.width as string | number };
        },
      },
      align: {
        default: "center",
        parseHTML: (element) => {
          return element.getAttribute("data-align");
        },
        renderHTML: (attributes) => {
          return { "data-align": attributes.align as string };
        },
      },
      alt: {
        default: undefined,
        parseHTML: (element) => {
          return element.getAttribute("alt");
        },
        renderHTML: (attributes) => {
          return { alt: attributes.alt as string | undefined };
        },
      },
    };
  },

  // parseHTML() {
  //   return [
  //     {
  //       tag: 'img[src*="tiptap.dev"]:not([src^="data:"]), img[src*="windows.net"]:not([src^="data:"])',
  //     },
  //   ];
  // },

  renderHTML({ HTMLAttributes }) {
    console.log("renderHTML Attributes:", HTMLAttributes); // Log all attributes during rendering
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setImageBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: "imageBlock",
            attrs: { src: attrs.src },
          });
        },

      setImageBlockAt:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContentAt(attrs.pos, {
            type: "imageBlock",
            attrs: { src: attrs.src },
          });
        },

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
    };
  },

  addOptions() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typed as always set, but undefined at runtime with @tiptap/extension-image 2.2.3
      ...this.parent?.(),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
});

export default ImageBlock;
