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

## Raycast extension

This repo also includes a local Raycast extension in `raycast/`.

```bash
cd raycast
bun install
bun run dev
```

Raycast opens the extension in developer mode. In Finder, select one image file, open Raycast, and run **Crop Top 16:10**. The command saves `<original-name>-top-16x10.png` in the same folder as the selected file.

From the repo root you can also run:

```bash
bun run raycast:dev
bun run raycast:build
bun run raycast:lint
```

## Docker

Production build is served with nginx (multi-stage image: install → build → static).

```bash
docker compose up --build
```

App: [http://localhost:8080](http://localhost:8080) (change the host port in `docker-compose.yml` if needed).

### Prebuilt image (GitHub Container Registry)

On each push to `main`, CI publishes an image to GHCR:

```bash
docker pull ghcr.io/<GITHUB_OWNER>/<GITHUB_REPO>:latest
docker run --rm -p 8080:80 ghcr.io/<GITHUB_OWNER>/<GITHUB_REPO>:latest
```

Replace `<GITHUB_OWNER>` and `<GITHUB_REPO>` with your GitHub user or org and repository name (use lowercase in the image URL). If the package is private, run `docker login ghcr.io` first.

## GitHub Pages

CI deploys the static build to **GitHub Pages** on every push to `main`.

1. In the repo, open **Settings → Pages** and set **Build and deployment** source to **GitHub Actions** (not “Deploy from a branch”).
2. After the first successful workflow run, open `https://<GITHUB_USER>.github.io/<GITHUB_REPO>/`.

The workflow sets `VITE_BASE_URL` so asset paths work under the `/repo-name/` project path.

## Crop logic

The 16:10 strip height is `round(width × 10 / 16)` pixels. The crop is the **top** of the image at native width. See `src/lib/cropTop16By10.ts`.
