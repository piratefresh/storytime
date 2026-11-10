import { Extension } from "@tiptap/core";

export const Float = Extension.create<{ types: string[] }>({
  name: "float",
  addOptions() {
    return {
      types: ["image", "node"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          float: {
            default: "default",
            parseHTML: (element) => {
              console.log("element: ", element);
              const float = element.style.float;
              if (!["left", "right", "none"].includes(float))
                return { float: "default" };
              return { float };
            },
            renderHTML: (attributes) => {
              console.log("attributes.float", attributes.float);
              if (attributes.float === "default") return {};
              console.log("attributes.float", attributes.float);
              return { style: `float: ${String(attributes.float)}` };
            },
          },
        },
      },
    ];
  },
});

export default Float;
