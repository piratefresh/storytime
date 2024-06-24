import { cn } from "@/lib/utils";
import { Node } from "@tiptap/pm/model";
import { Editor, NodeViewWrapper } from "@tiptap/react";
import { useCallback, useMemo, useRef } from "react";
import { ResizableImageResizer } from "./image-block-resizer";
import throttle from "throttleit";

interface ImageBlockViewProps {
  editor: Editor;
  getPos: () => number;
  node: Node & {
    attrs: {
      src: string;
    };
  };
  updateAttributes: (attrs: Record<string, string | number | null>) => void;
  selected: boolean;
}

const IMAGE_MINIMUM_WIDTH_PIXELS = 15;

export const ImageBlockView = (props: ImageBlockViewProps) => {
  const { editor, getPos, node, selected, updateAttributes } = props;
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const { src } = node.attrs;

  const handleResize = useMemo(
    () =>
      // Throttle our "on resize" handler, since the event fires very rapidly during
      // dragging, so rendering would end up stuttering a bit without a throttle
      throttle((event: MouseEvent) => {
        if (!imageRef.current) {
          return;
        }
        console.log("event: ", event);

        const originalBoundingRect = imageRef.current.getBoundingClientRect();

        // Get the "width" and "height" of the resized image based on the user's
        // cursor position after movement, if we were to imagine a box drawn from
        // the top left corner of the image to their cursor. (clientX/Y and
        // getBoundingClientRect both reference positions relative to the viewport,
        // allowing us to use them to calculate the new "resized" image dimensions.)
        const resizedWidth = event.clientX - originalBoundingRect.x;
        const resizedHeight = event.clientY - originalBoundingRect.y;

        // We always preserve the original image aspect ratio, setting only the
        // `width` to a specific number upon resize (and leaving the `height` of the
        // `img` as "auto"). So to determine the new width, we'll take the larger of
        // (a) the new resized width after the user's latest drag resize movement,
        // (b) the width proportional to the new resized height given the image
        // aspect ratio, or (c) a minimum width to prevent mistakes. This is similar
        // to what Google Docs image resizing appears to be doing, which feels
        // intuitive.
        const resultantWidth = Math.max(
          resizedWidth,
          (originalBoundingRect.width / originalBoundingRect.height) *
            resizedHeight,
          // Set a minimum width, since any smaller is probably a mistake, and we
          // don't want images to get mistakenly shrunken below a size which makes
          // it hard to later select/resize the image
          IMAGE_MINIMUM_WIDTH_PIXELS
        );
        console.log("resultantWidth", resultantWidth);
        updateAttributes({
          width: Math.round(resultantWidth),
        });
      }, 50),
    [updateAttributes]
  );

  const imageClasses = cn(
    "inline-block relative !my-0",
    node.attrs.align === "left" ? "ml-0" : "ml-auto",
    node.attrs.align === "right" ? "mr-0" : "mr-auto",
    node.attrs.align === "center" && "mx-auto"
  );

  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos());
  }, [getPos, editor.commands]);

  return (
    <NodeViewWrapper className="flex">
      <div
        className={imageClasses}
        contentEditable={false}
        ref={imageWrapperRef}
      >
        <img
          className="!my-0"
          ref={imageRef}
          data-drag-handle
          src={src}
          alt=""
          onClick={onClick}
          style={{ width: node.attrs.width }}
        />

        {selected && (
          <ResizableImageResizer
            onResize={handleResize}
            // className={classes.resizer}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageBlockView;
