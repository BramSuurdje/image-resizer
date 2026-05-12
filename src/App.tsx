"use client"

import { Download, Upload, X } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload"
import {
  canCrop,
  cropTopToCanvas,
  targetHeightForWidth,
} from "@/lib/cropTop16By10"

const MAX_BYTES = 80 * 1024 * 1024

function loadImageFromObjectUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("decode failed"))
    img.src = url
  })
}

export function App() {
  const [files, setFiles] = React.useState<File[]>([])
  const [cropError, setCropError] = React.useState<string | null>(null)
  const [resultBlob, setResultBlob] = React.useState<Blob | null>(null)
  const [resultSize, setResultSize] = React.useState<{
    width: number
    height: number
  } | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description:
        file.name.length > 20
          ? `"${file.name.slice(0, 20)}..." has been rejected`
          : `"${file.name}" has been rejected`,
    })
  }, [])

  const handleFilesChange = React.useCallback((next: File[]) => {
    setFiles(next)
    if (next.length === 0) {
      setCropError(null)
      setResultBlob(null)
      setResultSize(null)
      React.startTransition(() => {
        setPreviewUrl(null)
      })
    }
  }, [])

  React.useEffect(() => {
    const file = files[0]
    if (!file) {
      return
    }

    React.startTransition(() => {
      setCropError(null)
      setResultBlob(null)
      setResultSize(null)
    })

    let cancelled = false
    const objectUrl = URL.createObjectURL(file)

    void (async () => {
      try {
        const img = await loadImageFromObjectUrl(objectUrl)
        if (cancelled) return

        const w = img.naturalWidth
        const h = img.naturalHeight
        const needH = targetHeightForWidth(w)

        if (!canCrop(h, w)) {
          setCropError(
            `Image is too short for 16:10 at full width. Need at least ${needH}px height (image is ${h}px).`,
          )
          setResultBlob(null)
          setResultSize(null)
          return
        }

        setCropError(null)
        const canvas = cropTopToCanvas(img)
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (cancelled) {
                resolve()
                return
              }
              if (!blob) {
                reject(new Error("toBlob failed"))
                return
              }
              setResultBlob(blob)
              setResultSize({ width: canvas.width, height: canvas.height })
              resolve()
            },
            "image/png",
          )
        })
      } catch {
        if (!cancelled) {
          setCropError("Could not read this image.")
          setResultBlob(null)
          setResultSize(null)
        }
      } finally {
        URL.revokeObjectURL(objectUrl)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [files])

  React.useEffect(() => {
    if (!resultBlob) {
      React.startTransition(() => {
        setPreviewUrl(null)
      })
      return
    }
    const url = URL.createObjectURL(resultBlob)
    // Preview URL is owned by this effect; cleanup revokes the same URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pair with cleanup revoke for object URL lifecycle
    setPreviewUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [resultBlob])

  const handleDownload = React.useCallback(() => {
    if (!resultBlob) return
    const a = document.createElement("a")
    const href = URL.createObjectURL(resultBlob)
    a.href = href
    a.download = "top-16x10.png"
    a.click()
    URL.revokeObjectURL(href)
  }, [resultBlob])

  return (
    <div className="flex min-h-svh flex-col gap-6 p-6">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-2">
        <h1 className="font-heading text-lg font-medium tracking-tight">
          Top 16:10 crop
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Drop a tall screenshot. Keeps full width and crops the top to 16:10
          (PNG download).
        </p>
      </div>

      <FileUpload
        accept="image/*"
        maxFiles={1}
        maxSize={MAX_BYTES}
        className="mx-auto w-full max-w-lg"
        value={files}
        onValueChange={handleFilesChange}
        onFileReject={onFileReject}
        multiple={false}
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="text-muted-foreground size-6" />
            </div>
            <p className="text-sm font-medium">Drag and drop image here</p>
            <p className="text-muted-foreground text-xs">
              One image, up to 80MB (full-page screenshots). Paste with Ctrl+V
              or ⌘V.
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file) => (
            <FileUploadItem
              key={`${file.name}-${file.size}-${file.lastModified}`}
              value={file}
            >
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      {cropError ? (
        <p className="text-destructive mx-auto max-w-lg text-sm">{cropError}</p>
      ) : null}

      {resultSize && resultBlob && previewUrl ? (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Output: {resultSize.width} x {resultSize.height}px
          </p>
          <div className="bg-muted/30 overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Cropped 16:10 preview"
              className="max-h-[min(50vh,480px)] w-full object-contain object-top"
            />
          </div>
          <Button onClick={handleDownload} className="w-fit gap-2">
            <Download className="size-4" />
            Download PNG
          </Button>
        </div>
      ) : null}

      <p className="text-muted-foreground mx-auto max-w-lg font-mono text-xs">
        Press <kbd>d</kbd> to toggle dark mode
      </p>
    </div>
  )
}

export default App
