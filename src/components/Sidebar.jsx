import { useState } from 'react'

function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, isOpen, onClose }) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const startRename = (chat) => {
    setEditingId(chat.id)
    setEditValue(chat.title)
  }

  const commitRename = () => {
    if (editValue.trim()) {
      onRenameChat(editingId, editValue.trim())
    }
    setEditingId(null)
  }

  const handleDelete = (e, chatId) => {
    e.stopPropagation()
    onDeleteChat(chatId)
  }

  const handleSelect = (chatId) => {
    onSelectChat(chatId)
    onClose?.() // auto-close drawer on mobile after picking a chat
  }

  return (
    <>
      {/* Backdrop — only shown/clickable on mobile when drawer is open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="p-3 flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            + New Chat
          </button>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => editingId !== chat.id && handleSelect(chat.id)}
              onDoubleClick={() => startRename(chat)}
              className={`group w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                chat.id === activeChatId
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              {editingId === chat.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-gray-700 rounded px-1.5 py-0.5 text-white outline-none"
                />
              ) : (
                <span className="flex-1 truncate">{chat.title}</span>
              )}

              {editingId !== chat.id && (
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity shrink-0"
                  title="Delete chat"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-800 text-xs text-gray-500">
          Flowchat · Gemini 3.6
        </div>
      </div>
    </>
  )
}

export default Sidebar