import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      </div>
    </div>
  )
}

function EmptyState({ onSuggestionClick }) {
  const suggestions = [
    'Explain quantum computing simply',
    'Write a Python script to rename files',
    'Give me 5 tips for better sleep',
    'What are React hooks?',
  ]

  return (
    <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-2xl mb-4">
        ✨
      </div>
      <h2 className="text-xl font-semibold text-gray-200 mb-1">How can I help you today?</h2>
      <p className="text-sm text-gray-500 mb-6">Ask anything, or try one of these</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className="text-left text-sm text-gray-300 bg-gray-800/60 hover:bg-gray-800 border border-gray-800 rounded-xl px-4 py-3 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatWindow({ messages, isLoading, onSuggestionClick }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Only show the typing dots when we're loading AND the last message
  // (the empty assistant placeholder) hasn't received any text yet.
  const lastMessage = messages[messages.length - 1]
  const showTypingIndicator =
    isLoading && lastMessage?.role === 'assistant' && lastMessage.content === ''

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-4 py-6">
        {messages.length === 0 && <EmptyState onSuggestionClick={onSuggestionClick} />}
        {messages.map((msg, i) => {
          // Hide the empty placeholder bubble while dots are showing instead
          if (showTypingIndicator && i === messages.length - 1) return null
          return <MessageBubble key={i} role={msg.role} content={msg.content} />
        })}
        {showTypingIndicator && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default ChatWindow