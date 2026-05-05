# Gemma Chat

A calm, local-first chatbot UI for `gemma4:e4b` running through Ollama.

Gemma Chat is a React + TypeScript web app that connects to a local Ollama server, streams replies live, renders markdown cleanly, supports image/PDF/text attachments, and shows a collapsible thinking panel only when the model actually returns thinking tokens.

![Gemma Chat beige UI reference](docs/ui-reference-beige.png)

## Features

- Local chat with Ollama using `gemma4:e4b`
- Streaming responses through Ollama's `/api/chat`
- Optional thinking mode with a collapsible reasoning panel
- Image input for vision-capable Ollama models
- PDF and text/code file attachments with client-side text extraction
- Markdown, tables, lists, and code blocks through `react-markdown` and `remark-gfm`
- Warm beige, Claude-inspired interface
- Chat history saved locally in IndexedDB
- Runtime controls for thinking, temperature, and context window
- Vite proxy so the browser talks to `/ollama` instead of calling Ollama directly

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Lucide React icons
- Source Sans 3 and Newsreader through Fontsource
- `react-markdown`
- `remark-gfm`
- `pdfjs-dist`
- Dexie / IndexedDB
- Ollama

## Requirements

- Windows, macOS, or Linux
- Node.js 20 or newer
- npm
- Git
- Ollama
- A local Ollama model, default: `gemma4:e4b`

## Clone

Clone with SSH:

```bash
git clone git@github.com:MohammedSafwan10/gemma-chat.git
cd gemma-chat
```

Or clone with HTTPS:

```bash
git clone https://github.com/MohammedSafwan10/gemma-chat.git
cd gemma-chat
```

## Install Ollama And Gemma 4

Install Ollama from the official site:

[https://ollama.com/download](https://ollama.com/download)

After installing, pull the model:

```bash
ollama pull gemma4:e4b
```

Check that the model is available:

```bash
ollama list
```

Start Ollama if it is not already running:

```bash
ollama serve
```

On Windows, Ollama often starts automatically after installation. If `ollama serve` says the port is already in use, that usually means Ollama is already running.

## Run The Web App

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Use Gemma 4 Without This Web App

You can use the same local model directly from the terminal.

Run an interactive chat:

```bash
ollama run gemma4:e4b
```

Send one prompt and exit:

```bash
ollama run gemma4:e4b "Explain React hooks in simple words."
```

Use the local Ollama API:

```bash
curl http://127.0.0.1:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma4:e4b",
    "messages": [
      { "role": "user", "content": "Write a short TypeScript function." }
    ],
    "stream": false
  }'
```

On PowerShell:

```powershell
$body = @{
  model = "gemma4:e4b"
  messages = @(
    @{ role = "user"; content = "Write a short TypeScript function." }
  )
  stream = $false
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://127.0.0.1:11434/api/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## Change The Model

The default model is configured in:

```text
src/lib/constants.ts
```

```ts
export const MODEL_NAME = 'gemma4:e4b'
```

To use another Ollama model:

1. Pull it with Ollama.
2. Change `MODEL_NAME`.
3. Restart the Vite dev server.

Example:

```bash
ollama pull qwen3:4b
```

```ts
export const MODEL_NAME = 'qwen3:4b'
```

## How It Works

The browser sends chat requests to a Vite proxy:

```text
Browser -> Vite /ollama proxy -> http://127.0.0.1:11434/api/chat
```

The proxy is configured in `vite.config.ts`:

```ts
proxy: {
  '/ollama': {
    target: 'http://127.0.0.1:11434',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/ollama/, '/api'),
  },
}
```

Image attachments are sent to Ollama as base64 `images` on the user message. PDF and text/code files are extracted in the browser and appended as text context because Ollama chat does not take PDFs as native file objects.

Chat history is stored locally in IndexedDB through Dexie. No backend or cloud database is required.

## Privacy

Gemma Chat is designed for local use. The app talks to Ollama on your own machine through `127.0.0.1`. Chat history is stored in your browser's IndexedDB on your device. This app does not send your chats to a cloud service.

Be careful with files you attach. Their extracted text or image data is sent to your local Ollama server so the model can answer about them.

## Troubleshooting

If the app says it cannot connect to Ollama, check that Ollama is running:

```bash
ollama list
```

If the model is missing:

```bash
ollama pull gemma4:e4b
```

If the Vite app is using a different port, open the URL printed by `npm run dev`.

If another service is using port `11434`, stop that service or change the Ollama host configuration.

If attachments do not work, try a smaller file first. PDFs are extracted in the browser, so huge scanned PDFs may be slow or may not produce useful text.

## Project Structure

```text
src/
  components/     UI components
  hooks/          Chat state and streaming logic
  lib/            Constants, database, attachment, and Ollama helpers
  types/          Shared TypeScript types
  App.tsx         App layout
  index.css       App styling
```

## Notes

Thinking is not faked in the UI. The thinking accordion appears only when Ollama streams `message.thinking`. Normal answer text renders from `message.content`.

## License

MIT License. See [LICENSE](LICENSE).
