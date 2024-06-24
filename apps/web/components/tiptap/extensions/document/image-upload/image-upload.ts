import { Node, ReactNodeViewRenderer } from "@tiptap/react";
import { ImageUpload as ImageUploadComponent } from "./view/image-upload";
import { ImageOptions } from "@tiptap/extension-image";
import { UploadResult } from "./view/hooks";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUpload: () => ReturnType;
    };
  }
}

type CustomImageOptions = ImageOptions & {
  uploadImage: (file: File) => Promise<UploadResult>;
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
      ...this.parent?.(),
      uploadFunction: null, // Default to null, can be set through configure
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
