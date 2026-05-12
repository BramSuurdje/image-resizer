# image-resizer

Small web app that takes a **tall screenshot** (or any image), keeps the **full width**, and crops from the **top** to **16:10**. You get a **PNG** preview and download. Everything runs in the browser; images are not uploaded to a server.

## Features

- Drag-and-drop, file picker, or **paste** (Ctrl+V / ⌘V) when you are not focused in a text field
- One image at a time, up to **80MB** (handy for full-page captures)
- Clear error if the image is too short to form 16:10 at full width

## Stack

[Vite](https://vitejs.dev/) · [React](https://react.dev/) 19 · TypeScript · [Tailwind CSS](https://tailwindcss.com/) v4 · UI built with shadcn-style primitives ([shadcn/ui](https://ui.shadcn.com/) patterns, [Base UI](https://base-ui.com/) / Radix-style composition)

## Development

Requires [Bun](https://bun.sh/).

```bash
bun install
bun run dev
```

Other scripts: `bun run build`, `bun run preview`, `bun run lint`, `bun run typecheck`.

## Docker

Production build is served with nginx (multi-stage image: install → build → static).

```bash
docker compose up --build
```

App: [http://localhost:8080](http://localhost:8080) (change the host port in `docker-compose.yml` if needed).

## Crop logic

The 16:10 strip height is `round(width × 10 / 16)` pixels. The crop is the **top** of the image at native width. See `src/lib/cropTop16By10.ts`.
