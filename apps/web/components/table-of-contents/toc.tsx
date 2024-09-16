import { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  TableOfContentData,
  TableOfContentDataItem,
} from "@tiptap-pro/extension-table-of-contents";
import { Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

type ToCOnItemClick = (event: MouseEvent, itemId: string) => void;

interface ToCItemProps {
  item: TableOfContentDataItem;
  onItemClick: ToCOnItemClick;
  index: number;
}

export function ToCItem({ item, onItemClick }: ToCItemProps) {
  return (
    <div
      style={{ marginLeft: `${String(Number(item.level) - 1)}rem` }}
      className={cn(
        "block w-full truncate rounded bg-opacity-10 p-1 text-sm font-medium text-neutral-500 transition-all hover:bg-black hover:bg-opacity-5 dark:text-neutral-300",
        item.isActive &&
          "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100",
      )}
    >
      <a
        data-item-index={item.itemIndex}
        href={`#${item.id}`}
        onClick={(e) => onItemClick(e, item.id)}
      >
        {item.textContent}
      </a>
    </div>
  );
}

export function ToCEmptyState() {
  return (
    <div className="text-sm text-neutral-500">
      <p>Start editing your document to see the outline.</p>
    </div>
  );
}

interface ToCProps {
  items?: TableOfContentData;
  editor: Editor;
  editorRef: React.RefObject<HTMLDivElement>;
}

export function ToC({ items = [], editor, editorRef }: ToCProps) {
  if (items.length === 0) {
    return <ToCEmptyState />;
  }

  const onItemClick = (e: MouseEvent, id: string) => {
    e.preventDefault();

    const element = editor?.view.dom.querySelector(`[data-toc-id="${id}"]`);
    if (element && editorRef.current) {
      const pos = editor.view.posAtDOM(element, 0);
      console.log("element FOUND", element, pos);
      // set focus
      const tr = editor.view.state.tr;

      tr.setSelection(new TextSelection(tr.doc.resolve(pos)));

      editor.view.dispatch(tr);

      editor.view.focus();

      if (history.pushState) {
        // @ts-expect-error - fix later
        history.pushState(null, null, `#${id}`); // eslint-disable-line
      }

      editorRef.current.scrollTo({
        top: (element as HTMLElement).offsetTop - editorRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="mb-2 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
        Table of contents
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <ToCItem
            onItemClick={onItemClick}
            key={item.id}
            item={item}
            index={i + 1}
          />
        ))}
      </div>
    </>
  );
}
