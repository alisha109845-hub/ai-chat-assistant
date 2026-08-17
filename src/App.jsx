import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import SettingsPanel from './components/SettingsPanel'
import { sendMessageStream } from './services/gemini'

const STORAGE_KEY = 'ai-chat-assistant-chats'
const DEFAULT_SETTINGS = { systemPrompt: '', temperature: 0.9 }

function createNewChat() {
  return {
    id: crypto.randomUUID(),
    title: 'New Chat',
    messages: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

function loadChats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Backfill settings for chats saved before this feature existed
        return parsed.map((c) => ({ settings: { ...DEFAULT_SETTINGS }, ...c }))
      }
    }
  } catch {
    // corrupted data, fall through to default
  }
  return [createNewChat()]
}

function App() {
  const [chats, setChats] = useState(loadChats)
  const [activeChatId, setActiveChatId] = useState(chats[0].id)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Persist to localStorage any time chats change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  }, [chats])

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0]

  const updateChat = (chatId, updater) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, ...updater(c) } : c))
    )
  }

  const handleNewChat = () => {
    const chat = createNewChat()
    setChats((prev) => [chat, ...prev])
    setActiveChatId(chat.id)
  }

  const handleDeleteChat = (chatId) => {
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== chatId)
      const finalChats = remaining.length > 0 ? remaining : [createNewChat()]

      if (chatId === activeChatId) {
        setActiveChatId(finalChats[0].id)
      }
      return finalChats
    })
  }

  const handleRenameChat = (chatId, newTitle) => {
    updateChat(chatId, () => ({ title: newTitle }))
  }

  const handleSettingsChange = (newSettings) => {
    updateChat(activeChatId, () => ({ settings: newSettings }))
  }

  const handleSend = async (text) => {
    const newMessages = [...activeChat.messages, { role: 'user', content: text }]

    updateChat(activeChatId, (c) => ({
      messages: newMessages,
      title: c.messages.length === 0 ? text.slice(0, 30) : c.title,
    }))

    setIsLoading(true)
    setError(null)

    try {
      updateChat(activeChatId, (c) => ({
        messages: [...c.messages, { role: 'assistant', content: '' }],
      }))

      await sendMessageStream(
        newMessages,
        (partialText) => {
          setChats((prev) =>
            prev.map((c) => {
              if (c.id !== activeChatId) return c
              const msgs = [...c.messages]
              msgs[msgs.length - 1] = { role: 'assistant', content: partialText }
              return { ...c, messages: msgs }
            })
          )
        },
        activeChat.settings
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex bg-gray-950">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 p-3 border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            ☰
          </button>
          <span className="text-sm font-medium text-gray-200 flex-1 truncate">
            {activeChat.title}
          </span>
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-gray-400 hover:text-white p-1"
            title="Chat settings"
          >
            ⚙
          </button>
        </div>
        <ChatWindow
          messages={activeChat.messages}
          isLoading={isLoading}
          onSuggestionClick={handleSend}
        />
        {error && (
          <div className="max-w-3xl mx-auto w-full px-4 text-red-400 text-sm pb-2">
            {error}
          </div>
        )}
        <InputBar onSend={handleSend} disabled={isLoading} />
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={activeChat.settings}
        onChange={handleSettingsChange}
      />
    </div>
  )
}

export default App