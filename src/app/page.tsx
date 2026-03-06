'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickQuestions = [
  { text: 'No sé qué publicar, ayúdame', emoji: '🎯' },
  { text: 'Idea para un Reel viral', emoji: '🎬' },
  { text: 'Idea para un Carrusel', emoji: '🖼️' },
  { text: 'Dame hooks que enganchen', emoji: '⚡' },
  { text: '¿Cómo genero más guardados?', emoji: '📈' },
  { text: 'Genera hashtags para mi nicho', emoji: '#️⃣' },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      if (response.ok && data.success && data.message) {
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: `Error: ${data.details || data.error || 'Intenta de nuevo'}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Error de conexión. Intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  const clearConversation = () => {
    setMessages([])
    setInputValue('')
    inputRef.current?.focus()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-purple-900"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ViralContent AI</h1>
              <p className="text-sm text-purple-300 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Experto en Reels y Carruseles virales
              </p>
            </div>
          </div>
          <button
            onClick={clearConversation}
            className="text-purple-300 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            title="Limpiar conversación"
          >
            🔄
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Chat Area */}
        <div className="flex-1 px-4 py-6 overflow-y-auto" ref={scrollRef}>
          <div className="space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30 mb-6">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Hola! ¿Listo para viralizar tu contenido?</h2>
                <p className="text-purple-300 text-center max-w-md mb-8">
                  Soy tu experto en contenido para Instagram. Dime tu nicho y te ayudaré a crear Reels y Carruseles que generen engagement.
                </p>
                
                {/* Quick Questions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="h-auto py-4 px-4 text-left bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl transition-all duration-200 hover:shadow-lg group"
                      onClick={() => handleQuickQuestion(question.text)}
                      disabled={isLoading}
                    >
                      <span className="text-2xl mr-2">{question.emoji}</span>
                      <span className="text-sm font-medium text-white">{question.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-lg">🚀</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-md'
                      : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-pink-200' : 'text-purple-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-lg">👤</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-lg">🚀</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="ml-2 text-sm text-purple-300">Pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-gradient-to-t from-purple-900 via-purple-900/95 to-transparent pt-6 pb-4 px-4">
          {messages.length > 0 && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  className="whitespace-nowrap shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm text-white transition-all"
                  onClick={() => handleQuickQuestion(question.text)}
                  disabled={isLoading}
                >
                  {question.emoji} {question.text}
                </button>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ej: Mi nicho es fitness, ayúdame con ideas..."
              className="flex-1 h-12 pl-4 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
              disabled={!inputValue.trim() || isLoading}
            >
              <span className="text-xl">📤</span>
            </button>
          </form>
          <p className="text-center text-xs text-purple-400 mt-3">
            Powered by Grok (xAI) • Contenido viral para Instagram
          </p>
        </div>
      </main>
    </div>
  )
}
