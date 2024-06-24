import { BubbleMenu, Editor } from "@tiptap/react";
import { Toolbar } from "../ui/toolbar";
import { useTextmenuCommands } from "./hooks/useTextmenuCommands";
import { useTextmenuStates } from "./hooks/useTextmenuStates";
import React from "react";
import { Icon } from "../ui/icon";
import { AIDropdown } from "./components/AI-dropdown";
import { ContentTypePicker } from "./components/content-type-picker";
import { useTextmenuContentTypes } from "./hooks/useTextmenuContentTypes";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ColorPicker } from "./components/colorpicker";
import { FontFamilyPicker } from "./components/font-family-picker";
import { FontSizePicker } from "./components/font-size-picker";
import { EditLinkPopover } from "./components/edit-link-popover";

export type TextMenuProps = {
  appendTo?: React.RefObject<any>;
  editor: Editor;
};

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = React.memo(Toolbar.Button);
const MemoColorPicker = React.memo(ColorPicker);
const MemoFontFamilyPicker = React.memo(FontFamilyPicker);
const MemoFontSizePicker = React.memo(FontSizePicker);
const MemoContentTypePicker = React.memo(ContentTypePicker);

export function TextMenu({ editor, appendTo }: TextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const commands = useTextmenuCommands(editor);
  const states = useTextmenuStates(editor);
  const blockOptions = useTextmenuContentTypes(editor);
  //   const blockOptions = useTextmenuContentTypes(editor);

  return (
    <BubbleMenu
      tippyOptions={{ popperOptions: { placement: "top-start" } }}
      editor={editor}
      pluginKey="textMenu"
      shouldShow={states.shouldShow}
      updateDelay={100}
    >
      <Toolbar.Wrapper ref={menuRef}>
        <AIDropdown container={menuRef.current} editor={editor} />
        <Toolbar.Divider />
        <MemoContentTypePicker
          container={menuRef.current}
          options={blockOptions}
        />
        <MemoFontFamilyPicker
          container={menuRef.current}
          onChange={commands.onSetFont}
          value={states.currentFont || ""}
        />
        <MemoFontSizePicker
          container={menuRef.current}
          onChange={commands.onSetFontSize}
          value={states.currentSize || ""}
        />
        <Toolbar.Divider />
        <MemoButton
          tooltip="Bold"
          tooltipShortcut={["Mod", "B"]}
          onClick={commands.onBold}
          active={states.isBold}
        >
          <Icon name="Bold" />
        </MemoButton>
        <MemoButton
          tooltip="Italic"
          tooltipShortcut={["Mod", "I"]}
          onClick={commands.onItalic}
          active={states.isItalic}
        >
          <Icon name="Italic" />
        </MemoButton>
        <MemoButton
          tooltip="Underline"
          tooltipShortcut={["Mod", "U"]}
          onClick={commands.onUnderline}
          active={states.isUnderline}
        >
          <Icon name="Underline" />
        </MemoButton>
        <MemoButton
          tooltip="Strikehrough"
          tooltipShortcut={["Mod", "Shift", "S"]}
          onClick={commands.onStrike}
          active={states.isStrike}
        >
          <Icon name="Strikethrough" />
        </MemoButton>
        <MemoButton
          tooltip="Code"
          tooltipShortcut={["Mod", "E"]}
          onClick={commands.onCode}
          active={states.isCode}
        >
          <Icon name="Code" />
        </MemoButton>
        <MemoButton tooltip="Code block" onClick={commands.onCodeBlock}>
          <Icon name="Code2" />
        </MemoButton>
        <EditLinkPopover onSetLink={commands.onLink} />
        <Toolbar.Divider />
        <Popover modal>
          <PopoverTrigger asChild>
            <MemoButton
              active={!!states.currentHighlight}
              tooltip="Highlight text"
            >
              <Icon name="Highlighter" />
            </MemoButton>
          </PopoverTrigger>
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            side="top"
            sideOffset={8}
            portalProps={{ container: menuRef.current }}
          >
            <MemoColorPicker
              color={states.currentHighlight}
              onChange={commands.onChangeHighlight}
              onClear={commands.onClearHighlight}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <MemoButton active={!!states.currentColor} tooltip="Text color">
              <Icon name="Palette" />
            </MemoButton>
          </PopoverTrigger>
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            side="top"
            sideOffset={8}
            portalProps={{ container: menuRef.current }}
          >
            <MemoColorPicker
              color={states.currentColor}
              onChange={commands.onChangeColor}
              onClear={commands.onClearColor}
            />
          </PopoverContent>
        </Popover>
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
}
