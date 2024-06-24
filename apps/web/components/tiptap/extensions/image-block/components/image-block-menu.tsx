import { BubbleMenu, useCurrentEditor } from "@tiptap/react";
import React, { useCallback, useRef } from "react";
import { Instance, sticky } from "tippy.js";
import { v4 as uuid } from "uuid";

import getRenderContainer from "@/lib/editor/getRenderContainer";
import { MenuProps } from "../../../types";
import { Toolbar } from "@/components/ui/toolbar";
import { Icon } from "@/components/ui/icon";
import CustomImage from "../../image";
import ImageBlock from "../image-block";
import Image from "../../image/image";

export const ImageBlockMenu = ({ appendTo, editor }: MenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const tippyInstance = useRef<Instance | null>(null);

  if (!editor) return null;

  const getReferenceClientRect = useCallback(() => {
    const renderContainer = getRenderContainer(editor, "node-imageBlock");
    console.log("renderContainer: ", renderContainer);
    const rect =
      renderContainer?.getBoundingClientRect() ||
      new DOMRect(-1000, -1000, 0, 0);

    return rect;
  }, [editor]);

  const shouldShow = useCallback(() => {
    const isActive = editor.isActive("imageBlock");

    return isActive;
  }, [editor]);

  const onAlignImageLeft = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setImageBlockAlign("left")
      .run();
  }, [editor]);

  const onAlignImageCenter = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setImageBlockAlign("center")
      .run();
  }, [editor]);

  const onAlignImageRight = useCallback(() => {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .setImageBlockAlign("right")
      .run();
  }, [editor]);

  const onWidthChange = useCallback(
    (value: number) => {
      editor
        .chain()
        .focus(undefined, { scrollIntoView: false })
        .setImageBlockWidth(value)
        .run();
    },
    [editor]
  );

  // const onFloatRight = useCallback(() => {
  //   editor.chain().focus().updateAttributes("image", { float: "right" }).run();
  // }, [editor]);

  // const onFloatLeft = useCallback(() => {
  //   editor
  //     .chain()
  //     .focus(undefined, { scrollIntoView: false })
  //     .setImageBlockFloat("left")
  //     .run();
  // }, [editor]);

  // const onFloatUnset = useCallback(() => {
  //   editor
  //     .chain()
  //     .focus(undefined, { scrollIntoView: false })
  //     .setImageBlockFloat("none")
  //     .run();
  // }, [editor]);

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={`imageBlockMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        offset: [0, 8],
        popperOptions: {
          modifiers: [{ name: "flip", enabled: false }],
        },
        // getReferenceClientRect,
        onCreate: (instance: Instance) => {
          tippyInstance.current = instance;
        },
        appendTo: () => {
          return appendTo?.current;
        },
        plugins: [sticky],
        sticky: "popper",
      }}
    >
      <Toolbar.Wrapper shouldShowContent={true} ref={menuRef}>
        <Toolbar.Button
          tooltip="Align image left"
          active={editor.isActive("imageBlock", { align: "left" })}
          onClick={onAlignImageLeft}
        >
          <Icon name="AlignHorizontalDistributeStart" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Align image center"
          active={editor.isActive("imageBlock", { align: "center" })}
          onClick={onAlignImageCenter}
        >
          <Icon name="AlignHorizontalDistributeCenter" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Align image right"
          active={editor.isActive("imageBlock", { align: "right" })}
          onClick={onAlignImageRight}
        >
          <Icon name="AlignHorizontalDistributeEnd" />
        </Toolbar.Button>
        <Toolbar.Divider />
        <Toolbar.Button
          tooltip="Lift image up one level"
          onClick={() => editor.commands.lift("imageBlock")}
          disabled={!editor.can().lift("imageBlock")}
        >
          <Icon name="ArrowBigUpDash" />
        </Toolbar.Button>
        {/* <Toolbar.Button
          tooltip="Float image left"
          active={editor.isActive("imageBlock", { float: "left" })}
          onClick={onFloatLeft}
        >
          <Icon name="AlignLeft" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Float image unset"
          active={editor.isActive("imageBlock", { float: "none" })}
          onClick={onFloatUnset}
        >
          <Icon name="AlignJustify" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Float image right"
          active={editor.isActive("imageBlock", { float: "right" })}
          onClick={onFloatRight}
        >
          <Icon name="AlignRight" />
        </Toolbar.Button> */}
      </Toolbar.Wrapper>
    </BubbleMenu>
  );
};

export default ImageBlockMenu;
