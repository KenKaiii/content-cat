# Content Cat

AI-powered image and video generation platform with a visual workflow builder by Ken Kai.

> [!TIP]
> **Want to build your own apps with AI?** A free 7-day build challenge and 20+ step-by-step projects are in my free community: **[skool.com/raid](https://www.skool.com/raid)**

## Features

**Generation**
- Image generation with Nano Banana Pro (1K-4K, multiple aspect ratios)
- Video generation with Kling 2.6, Kling 2.5 Turbo, and Wan 2.6
- Reference image support for style guidance
- Image-to-video conversion

**Workflow Builder**
- Visual node-based editor for complex generation pipelines
- Drag-and-drop nodes: image gen, video gen, trim, concat, transitions, subtitles
- Save, load, import/export workflows
- Keyboard shortcuts (undo, redo, copy, paste)

**Characters & Products**
- Create AI characters from selfies for consistent face generation
- Product photography with varied backgrounds, lighting, angles

**Extras**
- Prompt gallery with curated presets
- Asset library for all generated content
- Session-based authentication

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/KenKaiii/content-cat/main/scripts/install.sh | bash
```

This installs Node.js, pnpm, PostgreSQL, Redis, and Docker automatically.

## Run

```bash
content-cat
```

Opens at [localhost:3000](http://localhost:3000)

## Configuration

Get your API key from [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) and add it in the app settings.

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Database**: PostgreSQL + Prisma
- **AI**: FAL.ai
- **Workflow**: XYFlow + Dagre
- **Styling**: Tailwind CSS 4

## Development

```bash
git clone https://github.com/KenKaiii/content-cat.git
cd content-cat
pnpm install
pnpm dev
```

## Docker

```bash
docker compose up -d postgres redis   # Database only
docker compose --profile production up -d   # Full stack
```

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0).

## Author

Created by **Ken Kai**
