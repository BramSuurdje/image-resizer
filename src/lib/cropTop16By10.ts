/** 16:10 width:height => height = width * 10/16 */
export function targetHeightForWidth(width: number): number {
  return Math.round((width * 10) / 16)
}

export function canCrop(naturalHeight: number, naturalWidth: number): boolean {
  return naturalHeight >= targetHeightForWidth(naturalWidth)
}

/** Top strip W x (W*10/16); caller must ensure `canCrop` is true. */
export function cropTopToCanvas(image: HTMLImageElement): HTMLCanvasElement {
  const w = image.naturalWidth
  const h = targetHeightForWidth(w)
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable")
  }
  ctx.drawImage(image, 0, 0, w, h, 0, 0, w, h)
  return canvas
}
