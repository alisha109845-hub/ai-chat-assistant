const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = 'gemini-3.6-flash'
const STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent`

export async function sendMessageStream(messages, onChunk, settings = {}) {
  const { systemPrompt = '', temperature = 0.9 } = settings

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const body = {
    contents,
    generationConfig: { temperature },
  }

  // Gemini takes the system prompt as a separate top-level field,
  // not as a message inside `contents`
  if (systemPrompt.trim()) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] }
  }

  const response = await fetch(`${STREAM_URL}?alt=sse&key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    const message = errorData?.error?.message || `Request failed: ${response.status}`

    if (response.status === 429) {
      const retryInfo = errorData?.error?.details?.find((d) =>
        d['@type']?.includes('RetryInfo')
      )
      const retryDelay = retryInfo?.retryDelay // e.g. "24.85s"
      const waitSeconds = retryDelay ? Math.ceil(parseFloat(retryDelay)) : null

      throw new Error(
        waitSeconds
          ? `Rate limit reached — please wait about ${waitSeconds} second${waitSeconds === 1 ? '' : 's'} before sending another message.`
          : 'Rate limit reached — please wait a moment before sending another message.'
      )
    }
    throw new Error(message)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep the last incomplete line for next chunk

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const jsonStr = line.slice(6)
      try {
        const parsed = JSON.parse(jsonStr)
        const textPiece = parsed.candidates?.[0]?.content?.parts?.[0]?.text
        if (textPiece) {
          fullText += textPiece
          onChunk(fullText)
        }
      } catch {
        // incomplete JSON chunk, skip
      }
    }
  }

  return fullText
}