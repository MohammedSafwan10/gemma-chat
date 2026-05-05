import type { ChatAttachment } from '../types/chat'

const maxTextCharacters = 30000

export async function filesToAttachments(files: FileList | File[]) {
  const list = Array.from(files)
  const attachments = await Promise.all(list.map(fileToAttachment))
  return attachments.filter(Boolean) as ChatAttachment[]
}

async function fileToAttachment(file: File): Promise<ChatAttachment | null> {
  if (file.type.startsWith('image/')) {
    const dataUrl = await readAsDataUrl(file)
    return {
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type,
      size: file.size,
      kind: 'image',
      imageBase64: dataUrl.split(',')[1] || '',
      imagePreview: dataUrl,
    }
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const [pdfjsLib, worker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.mjs?url'),
    ])
    pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default

    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      pages.push(`Page ${pageNumber}\n${text}`)
    }

    return {
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type || 'application/pdf',
      size: file.size,
      kind: 'pdf',
      text: pages.join('\n\n').slice(0, maxTextCharacters),
    }
  }

  if (isReadableTextFile(file)) {
    const text = await file.text()
    return {
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type || 'text/plain',
      size: file.size,
      kind: 'text',
      text: text.slice(0, maxTextCharacters),
    }
  }

  return null
}

function isReadableTextFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  return (
    file.type.startsWith('text/') ||
    ['csv', 'json', 'md', 'txt', 'ts', 'tsx', 'js', 'jsx', 'css', 'html', 'xml', 'yaml', 'yml'].includes(
      extension || '',
    )
  )
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result || '')))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

export function buildAttachmentPrompt(prompt: string, attachments: ChatAttachment[]) {
  const textAttachments = attachments.filter((attachment) => attachment.text?.trim())
  if (textAttachments.length === 0) return prompt

  const context = textAttachments
    .map(
      (attachment) =>
        `File: ${attachment.name}\nType: ${attachment.mimeType}\nExtracted text:\n${attachment.text}`,
    )
    .join('\n\n---\n\n')

  return `${prompt}\n\nAttached file context:\n\n${context}`
}
