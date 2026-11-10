import { Node, ReactNodeViewRenderer } from "@tiptap/react";
import { type ImageOptions } from "@tiptap/extension-image";
import { ImageUpload as ImageUploadComponent } from "./view/image-upload";
import { type UploadResult } from "./view/hooks";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUpload: () => ReturnType;
    };
  }
}

type CustomImageOptions = ImageOptions & {
  uploadImage: (file: File) => Promise<UploadResult | null>;
  maxFileSize: number;
  accept: string[];
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
};

export const ImageUpload = Node.create<CustomImageOptions>({
  name: "imageUpload",

  isolating: true,

  defining: true,

  group: "block",

  draggable: true,

  selectable: true,

  inline: false,

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML() {
    return ["div", { "data-type": this.name }];
  },

  addOptions() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typed as always set, but undefined at runtime with @tiptap/extension-image 2.2.3
      ...this.parent?.(),
      uploadImage: () => Promise.resolve(null), // set through configure()
    };
  },

  addCommands() {
    return {
      setImageUpload:
        () =>
        ({ commands }) =>
          commands.insertContent(`<div data-type="${this.name}"></div>`),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadComponent);
  },
});

export default ImageUpload;
