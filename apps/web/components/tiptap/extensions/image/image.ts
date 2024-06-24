import { Image as BaseImage } from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MarkdownNodeSpec } from "tiptap-markdown";
import ImageBlockView from "../image-block/components/image-block-view";

export const Image = BaseImage.extend({
  // selectable: true,
  // draggable: true,
  group: "block",

  addStorage(): { markdown: MarkdownNodeSpec } {
    return {
      markdown: {
        serialize(state, node) {
          console.log("Serializing imageBlock:", node);
          console.log("Serializing imageBlock state:", state);
        },
        parse: {
          setup(markdownit) {
            console.log("Setting up imageBlock parser:", markdownit);
          },
          updateDOM: (element) => {
            console.log("Updating DOM element for imageBlock:", element);
            // Ensure that the element is an image or has an image to manipulate
            const img = element.querySelector("img"); // finds an img element within the provided element
            if (img) {
              console.log("Image found:", img.src);
            } else {
              console.log("No image found, creating one.");
              const newImg = document.createElement("img");
              element.appendChild(newImg); // Append the new image to the element
              return newImg;
            }
            return img; // Return the existing or newly created image
          },
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
});

export default Image;
