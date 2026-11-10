import { Extension } from "@tiptap/core";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { type Node as ProsemirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";

function createLineNumberWidget(lineNumber: string) {
  const lineNumberElement = document.createElement("div");
  lineNumberElement.textContent = lineNumber.toString();
  lineNumberElement.className =
    "cursor-none select-none absolute left-0 z-index[-1] text-sm leading-none";
  lineNumberElement.style.userSelect = "none";
  lineNumberElement.style.marginTop = "10px";

  return lineNumberElement;
}

function generateLineNumbers(
  doc: ProsemirrorNode,
  shouldDisplayLineNumbers: boolean
) {
  if (!shouldDisplayLineNumbers) {
    return DecorationSet.empty;
  }

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
          linePos += (lines[i]?.length ?? 0) + 1; // +1 for the newline character
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

const lineNumbersKey = new PluginKey("lineNumbers");

export const LineNumbers = Extension.create<{ showLineNumbers: boolean }>({
  name: "lineNumbers",

  addOptions() {
    return {
      showLineNumbers: true,
    };
  },

  addProseMirrorPlugins() {
    const { options } = this;
    return [
      new Plugin({
        key: lineNumbersKey,
        state: {
          init(_, { doc }) {
            return generateLineNumbers(doc, options.showLineNumbers);
          },
          apply(transaction, oldState) {
            const meta = transaction.getMeta("lineNumbers") as
              | { showLineNumbers?: boolean }
              | undefined;
            const newState = meta?.showLineNumbers;

            if (newState !== undefined) {
              options.showLineNumbers = newState;

              return generateLineNumbers(transaction.doc, newState);
            }
            return oldState;
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
