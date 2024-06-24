import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

type ResizableImageResizerProps = {
  className?: string;
  onResize: (event: MouseEvent) => void;
};

// const useStyles = makeStyles({ name: { ResizableImageResizer } })((theme) => ({
//   root: {
//     position: "absolute",
//     // The `outline` styles of the selected image add 3px to the edges, so we'll
//     // position this offset by 3px outside to the bottom right
//     bottom: -3,
//     right: -3,
//     width: 12,
//     height: 12,
//     background: theme.palette.primary.main,
//     cursor: "nwse-resize",
//   },
// }));

export function ResizableImageResizer({
  onResize,
  className,
}: ResizableImageResizerProps) {
  //   const { classes, cx } = useStyles();
  const [mouseDown, setMouseDown] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      onResize(event);
    };

    if (mouseDown) {
      // If the user is currently holding down the resize handle, we'll have mouse
      // movements fire the onResize callback (since the user would be "dragging" the
      // handle)
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseDown, onResize]);

  useEffect(() => {
    const handleMouseUp = () => setMouseDown(false);

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = useCallback((_event: React.MouseEvent) => {
    setMouseDown(true);
  }, []);

  return (
    // There isn't a great role to use here (perhaps role="separator" is the
    // closest, as described here https://stackoverflow.com/a/43022983/4543977,
    // but we don't do keyboard-based resizing at this time so it doesn't make
    // sense to have it keyboard focusable)
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <>
      <div
        className="absolute cursor-nw-resize h-2.5 w-2.5 z-20 top-0 left-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => {
          handleMouseDown();
        }}
      ></div>

      <div
        className="absolute cursor-nesw-resize h-2.5 w-2.5 z-20 top-0 right-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => handleMouseDown()}
      ></div>

      <div
        className="absolute cursor-nwse-resize w-2.5 h-2.5 z-20 right-0 bottom-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => handleMouseDown()}
      ></div>

      <div
        className="absolute cursor-nesw-resize h-2.5 w-2.5 z-20 left-0 bottom-0 bg-[#335dff] border border-[#335dff]"
        onMouseDown={() => handleMouseDown()}
      ></div>
    </>
  );
}
