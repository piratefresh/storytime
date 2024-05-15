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

export const GenerateText = Extension.create<GenerateTextOptions>({
  name: "generateText",

  addOptions() {
    return {
      getReplacementText: (inputText: string) => inputText, // Default implementation
    };
  },

  addCommands() {
    return {
      generateText:
        (text: string) =>
        ({ state, dispatch }) => {
          if (state.selection.empty) return false;

          const { from, to } = state.selection;
          const textToReplace = state.doc.textBetween(from, to, " ");
          const replacementText =
            this.options.getReplacementText(textToReplace);

          console.log("state: ", state);
          console.log("text: ", textToReplace);
          console.log("replacementText: ", replacementText);

          const transaction = state.tr;
          transaction.replaceWith(from, to, state.schema.text(replacementText));
          transaction.setSelection(
            TextSelection.create(
              transaction.doc,
              from,
              from + replacementText.length
            )
          );

          dispatch(transaction);
          return true;
        },
    };
  },
});
