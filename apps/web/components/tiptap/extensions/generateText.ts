import { Extension } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

export interface GenerateTextOptions {
  getReplacementText: (inputText: string) => string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    generateText: {
      /**
       * Replace the current selection with processed text.
       */
      generateText: (text: string) => ReturnType;
    };
  }
}

export const GenerateText = Extension.create({
  name: "generateText",

  addCommands() {
    return {
      generateText:
        (replacementText: string) =>
        ({ state, dispatch }) => {
          const { from, to } = state.selection;

          if (state.selection.empty || !replacementText) return false;

          const transaction = state.tr;
          transaction.replaceWith(from, to, state.schema.text(replacementText));
          transaction.setSelection(
            TextSelection.create(
              transaction.doc,
              from,
              from + replacementText.length
            )
          );

          if (dispatch) {
            dispatch(transaction);
          }
          return true;
        },
    };
  },
});
