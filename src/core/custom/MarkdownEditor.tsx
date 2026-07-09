import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  UndoRedo,
  imagePlugin,
  InsertImage,
  Separator,
} from "@mdxeditor/editor"

import "@mdxeditor/editor/style.css"

import { handleUpload } from "../lib/utils"

export interface IMarkdownEditorProps {
  className?: string
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({
  className,
  value,
  onChange,
}: IMarkdownEditorProps) {
  return (
    <div className="rounded-xl border bg-background">
      <MDXEditor
        markdown={value ?? ""}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          markdownShortcutPlugin(),
          imagePlugin({
            async imageUploadHandler(image: File) {
              const { url } = await handleUpload(image, {
                path: "postMedia",
              })

              return url!
            },
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex w-full gap-1 overflow-x-auto px-2 py-1">
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <InsertImage />
              </div>
            ),
          }),
        ]}
        className={className}
      />
    </div>
  )
}
