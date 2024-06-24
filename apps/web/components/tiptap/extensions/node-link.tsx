import {
  Extension,
  InputRule,
  Node,
  Range,
  mergeAttributes,
  Editor,
} from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import { PluginKey, TextSelection } from "@tiptap/pm/state";
import type { Node as ModelNode } from "@tiptap/pm/model";
import {
  NodeViewWrapper,
  NodeViewWrapperProps,
  ReactNodeViewRenderer,
  ReactRenderer,
} from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import type { ComponentPropsWithoutRef } from "react";
import React from "react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CommandInput } from "cmdk";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { findSuggestionMatch } from "@/lib/editor/findSuggestionMatch";

const DOM_RECT_FALLBACK: DOMRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON() {
    return {};
  },
};

export const LinkPluginKey = new PluginKey("LinkPluginKey");

export type LinkCommandOptions = {
  suggestion: Omit<SuggestionOptions, "editor">;
};

export type SuggestionListRef = {
  // For convenience using this SuggestionList from within the
  // mentionSuggestionOptions, we'll match the signature of SuggestionOptions's
  // `onKeyDown` returned in its `render` function
  onKeyDown: NonNullable<
    ReturnType<NonNullable<SuggestionOptions<string>["render"]>>["onKeyDown"]
  >;
};

const insertDoubleBracketsInputRule = () => {
  return new InputRule({
    find: /\[\[$/,
    handler: ({ state, range }) => {
      const { tr } = state;
      tr.insertText("[[]]", range.from - 1, range.to);
      tr.setSelection(TextSelection.create(tr.doc, range.from + 2));
    },
  });
};

export const Link = Extension.create<LinkCommandOptions>({
  name: "NodeLink",
  inline: true,
  selectable: true,
  atom: true,

  addOptions() {
    return {
      suggestion: {
        char: "[[]]",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: any;
        }) => {
          props.command({ editor, range });
        },
        pluginKey: LinkPluginKey,

        render: () => {
          let component: ReactRenderer<SuggestionListRef> | null = null;
          let popup: TippyInstance | undefined;
          return {
            onStart: (props) => {
              component = new ReactRenderer(NodeLinkList, {
                editor: props.editor,
                props,
              });
              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect: () =>
                  props.clientRect?.() ?? DOM_RECT_FALLBACK,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })[0];
            },

            onUpdate(props) {
              component?.updateProps(props);

              popup?.setProps({
                getReferenceClientRect: () =>
                  props.clientRect?.() ?? DOM_RECT_FALLBACK,
              });
            },

            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup?.hide();
                return true;
              }

              if (!component?.ref) {
                return false;
              }

              return component.ref.onKeyDown(props);
            },
            onExit: () => {
              popup?.destroy();
              component?.destroy();
            },
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: `span[data-state="${this.name}"]`,
      },
    ];
  },

  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: ModelNode;
    HTMLAttributes: Record<string, any>;
  }) {
    return [
      "span",
      mergeAttributes(
        { "data-state": this.name },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      this.options.renderLabel({
        options: this.options,
        node,
      }),
    ];
  },
  addInputRules() {
    return [insertDoubleBracketsInputRule()];
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        findSuggestionMatch,
        ...this.options.suggestion,
      }),
    ];
  },
});

interface NodeLinkListProps extends ComponentPropsWithoutRef<typeof Command> {
  items: any[];
  query: string;
  editor: Editor;
  range: Range;
}

export type NodeLinkListRef = {
  // For convenience using this SuggestionList from within the
  // mentionSuggestionOptions, we'll match the signature of SuggestionOptions's
  // `onKeyDown` returned in its `render` function
  onKeyDown: NonNullable<
    ReturnType<NonNullable<SuggestionOptions<string>["render"]>>["onKeyDown"]
  >;
};

const NodeLinkList = React.forwardRef<NodeLinkListRef, NodeLinkListProps>(
  ({ children, className, query, editor, itemScope, range, ...rest }, ref) => {
    const commandListRef = React.useRef<HTMLDivElement>(null);

    // const [searchQuery, setSearchQuery] = React.useState<string>("");

    React.useEffect(() => {
      const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
      const onKeyDown = (e: KeyboardEvent) => {
        if (navigationKeys.includes(e.key)) {
          e.preventDefault();
          const commandRef = document.querySelector("#node-command");

          if (commandRef)
            commandRef.dispatchEvent(
              new KeyboardEvent("keydown", {
                key: e.key,
                cancelable: true,
                bubbles: true,
              })
            );

          return false;
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    }, []);

    return (
      <Command
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        id="node-command"
        className={cn("border rounded-md min-w-60", className)}
        {...rest}
      >
        <CommandInput value={query} style={{ display: "none" }} />
        <CommandList ref={commandListRef}>
          <CommandGroup>
            {rest.items?.map((item) => (
              <CommandItem
                key={item.name}
                value={item.name}
                onSelect={() => {
                  range.to += 2;
                  editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .insertContentAt(
                      range.from,
                      `<span data-tooltip="${item.name}" data-meta="${item.text}">${item.name}</span>`
                    )
                    .run();
                }}
              >
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }
);

const TooltipComponent = (props: NodeViewWrapperProps) => {
  return (
    <NodeViewWrapper as="span">
      <Tooltip>
        <TooltipTrigger className="text-neutral-400 underline">
          {props.node.attrs.label}
        </TooltipTrigger>
        <TooltipContent className="max-w-96">
          <p className="font-semibold !mt-0">{props.node.attrs.label}</p>
          {props.node.attrs.metaData}
        </TooltipContent>
      </Tooltip>
    </NodeViewWrapper>
  );
};

export const CustomTooltipNode = Node.create({
  name: "customTooltip",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: (element) =>
          element instanceof HTMLElement
            ? element.getAttribute("data-tooltip")
            : null,
      },
      metaData: {
        default: null,
        parseHTML: (element) =>
          element instanceof HTMLElement
            ? element.getAttribute("data-meta")
            : null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-tooltip]",
        getAttrs: (element) =>
          element instanceof HTMLElement
            ? {
                label: element.getAttribute("data-tooltip"),
                metaData: element.getAttribute("data-meta"),
              }
            : {},
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "span",
      { "data-tooltip": node.attrs.label, "data-meta": node.attrs.metaData },
      node.attrs.label,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TooltipComponent);
  },
});
