import { Extension } from "@tiptap/core";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Node as ProsemirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";

function createLineNumberWidget(lineNumber: string) {
  const lineNumberElement = document.createElement("div");
  lineNumberElement.textContent = lineNumber.toString();
  lineNumberElement.className =
    "cursor-pointer select-none absolute left-0 z-index[-1] text-sm";
  lineNumberElement.style.userSelect = "none";

  return lineNumberElement;
}

// function generateLineNumbers(doc: ProsemirrorNode) {
//   const decorations: Decoration[] = [];
//   let lineNumber = 1;

//   doc.descendants((node, pos) => {
//     if (node.isTextblock) {
//       // Get the text content of the node
//       const text = node.textContent;
//       const lines = text.split("\n");
//       let linePos = pos;

//       lines.forEach((line, index) => {
//         // For the first line in the node, add the line number widget.
//         // For subsequent lines, account for the new lines when positioning the widget.
//         if (index > 0) {
//           linePos += lines[index - 1].length + 1; // '+1' for the newline character
//         }

//         decorations.push(
//           Decoration.widget(
//             linePos,
//             createLineNumberWidget(String(lineNumber++)),
//             { side: -1 }
//           )
//         );
//       });
//     }
//   });

//   return DecorationSet.create(doc, decorations);
// }

function generateLineNumbers(doc: ProsemirrorNode) {
  const decorations: Decoration[] = [];
  let lineNumber = 1;

  doc.descendants((node, pos) => {
    if (node.isTextblock) {
      // Calculate number of lines by counting newline characters
      const text = node.textContent;
      const lines = text.split("\n");
      let linePos = pos;

      for (let i = 0; i < lines.length; i++) {
        // Position the line number at the start of each new line
        const widget = Decoration.widget(
          linePos,
          createLineNumberWidget(String(lineNumber++)),
          { side: -1 }
        );
        decorations.push(widget);

        // Adjust linePos to the start of the next line
        if (i < lines.length - 1) {
          linePos += lines[i].length + 1; // +1 for the newline character
        }
      }

      // Handle the case of an empty node (no content, but should have one line number)
      if (lines.length === 0) {
        const widget = Decoration.widget(
          pos,
          createLineNumberWidget(String(lineNumber++)),
          { side: -1 }
        );
        decorations.push(widget);
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

export const LineNumbers = Extension.create({
  name: "lineNumbers",

  onFocused() {
    console.log("onFocused");
  },
  onSelectionUpdate() {
    console.log("select");
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("lineNumbers"),
        state: {
          init(_, { doc }) {
            return generateLineNumbers(doc);
          },
          apply(transaction, oldState) {
            return transaction.docChanged
              ? generateLineNumbers(transaction.doc)
              : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
