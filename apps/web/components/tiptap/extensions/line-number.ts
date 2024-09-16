import { Extension } from '@tiptap/core';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

function createLineNumberWidget(lineNumber: string) {
  const lineNumberElement = document.createElement('div');
  lineNumberElement.textContent = lineNumber.toString();
  lineNumberElement.className =
    'cursor-none select-none absolute left-0 z-index[-1] text-sm leading-none';
  lineNumberElement.style.userSelect = 'none';
  lineNumberElement.style.marginTop = '10px';

  return lineNumberElement;
}

function generateLineNumbers(
  doc: ProsemirrorNode,
  shouldDisplayLineNumbers: boolean,
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
      const lines = text.split('\n');
      let linePos = pos;

      for (let i = 0; i < lines.length; i++) {
        // Position the line number at the start of each new line
        const widget = Decoration.widget(
          linePos,
          createLineNumberWidget(String(lineNumber++)),
          { side: -1 },
        );
        decorations.push(widget);

        // Adjust linePos to the start of the next line
        if (i < lines.length - 1) {
          // @ts-expect-error - fix later
          linePos += lines[i].length + 1; // +1 for the newline character
        }
      }

      // Handle the case of an empty node (no content, but should have one line number)
      if (lines.length === 0) {
        const widget = Decoration.widget(
          pos,
          createLineNumberWidget(String(lineNumber++)),
          { side: -1 },
        );
        decorations.push(widget);
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

const lineNumbersKey = new PluginKey('lineNumbers');

export const LineNumbers = Extension.create({
  name: 'lineNumbers',

  addOptions() {
    return {
      showLineNumbers: true,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      new Plugin({
        key: lineNumbersKey,
        state: {
          init(_, { doc }) {
            return generateLineNumbers(doc, extension.options.showLineNumbers);
          },
          apply(transaction, oldState) {
            const newState =
              transaction.getMeta('lineNumbers')?.showLineNumbers;

            if (newState !== undefined) {
              extension.options.showLineNumbers = newState;

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
