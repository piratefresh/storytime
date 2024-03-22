import { Extension } from "@tiptap/core";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Node as ProsemirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";

function createLineNumberWidget(lineNumber: string) {
  const lineNumberElement = document.createElement("div");
  lineNumberElement.textContent = lineNumber.toString();
  lineNumberElement.className =
    "cursor-pointer select-none absolute right-0 z-index[-1]";
  lineNumberElement.style.userSelect = "none"; // Ensures the line number is not selectable

  return lineNumberElement;
}

// function generateLineNumbers(doc: ProsemirrorNode) {
//   const decorations: Decoration[] = [];
//   let lineNumber = 1;

//   doc.descendants((node, pos) => {
//     if (node.isBlock && !node.isTextblock) {
//       console.log("node.isBlock && !node.isTextblock: ", node);
//       // If it's a block (like a list item), but not a text block, we count the whole block as one line
//       decorations.push(
//         Decoration.widget(pos, createLineNumberWidget(lineNumber++), {
//           side: -1,
//         })
//       );
//       // We don't descend into this node, which effectively skips its children
//       return false;
//     } else if (node.isTextblock) {
//       console.log("node.isTextblock: ", node);
//       // For text blocks, we add a line number
//       decorations.push(
//         Decoration.widget(pos, createLineNumberWidget(lineNumber++), {
//           side: -1,
//         })
//       );
//     }
//     // We continue descending into text blocks, but not into other block types
//     return node.isTextblock;
//   });

//   return DecorationSet.create(doc, decorations);
// }

function generateLineNumbers(doc: ProsemirrorNode) {
  const decorations: Decoration[] = [];
  let lineNumber = 1;

  doc.descendants((node, pos) => {
    if (node.isTextblock) {
      // Get the text content of the node
      const text = node.textContent;
      const lines = text.split("\n");
      let linePos = pos;

      lines.forEach((line, index) => {
        // For the first line in the node, add the line number widget.
        // For subsequent lines, account for the new lines when positioning the widget.
        if (index > 0) {
          linePos += lines[index - 1].length + 1; // '+1' for the newline character
        }

        decorations.push(
          Decoration.widget(
            linePos,
            createLineNumberWidget(String(lineNumber++)),
            { side: -1 }
          )
        );
      });
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
