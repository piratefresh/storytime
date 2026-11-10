import { type Node } from "@tiptap/pm/model";
import { type NodeSelection } from "@tiptap/pm/state";
import { type Editor, type JSONContent } from "@tiptap/react";
import { useCallback } from "react";

const useContentItemActions = (
  editor: Editor,
  currentNode: Node | null,
  currentNodePos: number
) => {
  const resetTextFormatting = useCallback(() => {
    const chain = editor.chain();

    chain.setNodeSelection(currentNodePos).unsetAllMarks();

    if (currentNode?.type.name !== "paragraph") {
      chain.setParagraph();
    }

    chain.run();
  }, [editor, currentNodePos, currentNode?.type.name]);

  const duplicateNode = useCallback(() => {
    editor.commands.setNodeSelection(currentNodePos);

    const { $anchor } = editor.state.selection;
    // node(1) is undefined when the selection sits at the document root
    const anchorNode = $anchor.node(1) as Node | undefined;
    const selectedNode =
      anchorNode ?? (editor.state.selection as NodeSelection).node;

    editor
      .chain()
      .setMeta("hideDragHandle", true)
      .insertContentAt(
        currentNodePos + (currentNode?.nodeSize ?? 0),
        selectedNode.toJSON() as JSONContent
      )
      .run();
  }, [editor, currentNodePos, currentNode?.nodeSize]);

  const copyNodeToClipboard = useCallback(() => {
    editor
      .chain()
      .setMeta("hideDragHandle", true)
      .setNodeSelection(currentNodePos)
      .run();

    document.execCommand("copy");
  }, [editor, currentNodePos]);

  const deleteNode = useCallback(() => {
    editor
      .chain()
      .setMeta("hideDragHandle", true)
      .setNodeSelection(currentNodePos)
      .deleteSelection()
      .run();
  }, [editor, currentNodePos]);

  const handleAdd = useCallback(() => {
    if (currentNodePos !== -1) {
      const currentNodeSize = currentNode?.nodeSize ?? 0;
      const insertPos = currentNodePos + currentNodeSize;
      const currentNodeIsEmptyParagraph =
        currentNode?.type.name === "paragraph" &&
        currentNode.content.size === 0;
      const focusPos = currentNodeIsEmptyParagraph
        ? currentNodePos + 2
        : insertPos + 2;

      editor
        .chain()
        .command(({ dispatch, tr, state }) => {
          if (dispatch) {
            if (currentNodeIsEmptyParagraph) {
              tr.insertText("/", currentNodePos, currentNodePos + 1);
            } else if (state.schema.nodes.paragraph) {
              tr.insert(
                insertPos,
                state.schema.nodes.paragraph.create(null, [
                  state.schema.text("/"),
                ])
              );
            }

            dispatch(tr);
          }

          return true;
        })
        .focus(focusPos)
        .run();
    }
  }, [currentNode, currentNodePos, editor]);

  return {
    resetTextFormatting,
    duplicateNode,
    copyNodeToClipboard,
    deleteNode,
    handleAdd,
  };
};

export default useContentItemActions;
