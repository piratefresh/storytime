import { type Editor, NodeViewWrapper } from "@tiptap/react"
import { useCallback } from "react"
import type { UploadResult } from "./hooks"
import { ImageUploader } from "./image-uploader"

export function ImageUpload({
  getPos,
  editor,
  extension,
}: {
  getPos: () => number
  editor: Editor
  extension: { options: { uploadImage: (file: File) => Promise<UploadResult | null> } }
}) {
  const onUpload = useCallback(
    (url: string) => {
      if (url) {
        editor.chain().setImageBlock({ src: url }).deleteRange({ from: getPos(), to: getPos() }).focus().run()
      }
    },
    [getPos, editor],
  )

  return (
    <NodeViewWrapper>
      <div className="p-0 m-0" data-drag-handle>
        <ImageUploader onUpload={onUpload} uploadImageFn={extension.options.uploadImage} />
      </div>
    </NodeViewWrapper>
  )
}

export default ImageUpload