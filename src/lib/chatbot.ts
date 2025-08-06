// lib/chatbot.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  answer: string
}

export async function sendMessage(message: string, token: string): Promise<string> {
  const res = await fetch(`${API_URL}/ai/chatbot`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question: message }),
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.detail || errorData.message || 'Gagal mengirim pesan')
  }

  const data: ChatResponse = await res.json()
  return data.answer
}