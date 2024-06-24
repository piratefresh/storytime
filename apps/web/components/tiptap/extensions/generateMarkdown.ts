import { extensions } from "@tiptap/core";
import { Markdown } from "tiptap-markdown";

Markdown.extend({
  addCommands() {
    const commands = extensions.Commands.config.addCommands();
    return {
      ...this.parent(),
      insertContentAt: (range, content, options) => (props) => {
        const parsed = props.editor.storage.markdown.parser.parse(content, {
          inline: true,
        });
        // do something here
        return commands.insertContentAt(range, parsed, options)(props);
      },
    };
  },
});
