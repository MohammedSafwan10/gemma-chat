# Gemma Studio

A local-first chatbot for `gemma4:e4b` running through Ollama.

## Run

Start Ollama if it is not already running:

```powershell
ollama serve
```

Start the app:

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- shadcn-inspired local UI components
- `react-markdown` + `remark-gfm`
- Ollama native `/api/chat` streaming through the Vite `/ollama` proxy

## Notes

The app talks to local Ollama only:

```text
Browser -> Vite dev server -> http://127.0.0.1:11434/api/chat
```

The default model is set in `src/App.tsx`:

```ts
const modelName = 'gemma4:e4b'
```
