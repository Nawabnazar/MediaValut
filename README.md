# MediaVault

A premium Apple-inspired media gallery built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **SQLite**, and **Prisma**.

## Features

- Image & video upload with drag-and-drop (multi-file)
- SQLite metadata via Prisma ORM
- Automatic thumbnail generation (Sharp; ffmpeg optional for video)
- Masonry grid with featured stack effect & parallax
- Dynamic blurred background on hover
- Full-screen viewer (zoom/pan for images, playback for videos)
- Search, sort, and tab filters
- Glassmorphism UI with dark/light theme
- Virtualized gallery for 80+ items

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- **ffmpeg** (optional, recommended for video thumbnails)

### Install

If `npm` is not found, install [Node.js](https://nodejs.org/) (LTS), or use the bundled runtime after first setup:

```bash
# One-time: download Node into .node/ (macOS arm64)
curl -fsSL https://nodejs.org/dist/v22.15.0/node-v22.15.0-darwin-arm64.tar.gz -o /tmp/node.tar.gz
mkdir -p .node && tar -xzf /tmp/node.tar.gz -C .node --strip-components=1

# Then either:
export PATH="$PWD/.node/bin:$PATH"
npm install
npm run db:push
npm run dev

# Or use the helper script:
chmod +x scripts/npm.sh
./scripts/npm.sh install
./scripts/npm.sh run dev
```

**Production preview** (build + serve):

```bash
npm run preview
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Copy `.env.example` to `.env`:

```
DATABASE_URL="file:../database/mediavault.db"
```

## Project Structure

```
app/                 # Next.js App Router pages & API
components/          # UI, gallery, upload, viewer
contexts/            # Global media state
hooks/               # Data fetching
lib/                 # DB, thumbnails, utilities
prisma/              # Schema
database/            # SQLite file
public/uploads/      # images, videos, thumbnails
types/               # TypeScript types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to SQLite |
| `npm run db:studio` | Open Prisma Studio |

## API

- `GET /api/media` — List media (`?type=image|video&sort=recent|oldest&q=`)
- `GET/PATCH/DELETE /api/media/[id]` — Single item operations
- `POST /api/upload` — Multipart upload (`files` field)

## Performance Notes

- Lazy-loaded images with Next.js `Image`
- Virtualized rows for large libraries (80+ items)
- WebP thumbnails via Sharp
- SWR caching for media list

## License

MIT
