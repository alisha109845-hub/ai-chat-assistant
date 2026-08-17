function SettingsPanel({ isOpen, onClose, settings, onChange }) {
  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-900 border-l border-gray-800 z-50 p-5 flex flex-col gap-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Chat Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div>
          <label className="text-sm text-gray-300 font-medium block mb-1.5">
            System Prompt
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Instructions the model follows for this entire chat (persona, tone, constraints).
          </p>
          <textarea
            value={settings.systemPrompt}
            onChange={(e) => onChange({ ...settings, systemPrompt: e.target.value })}
            placeholder="e.g. You are a concise, friendly coding tutor who explains concepts with analogies."
            rows={5}
            className="w-full bg-gray-800 text-white text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 font-medium block mb-1.5">
            Temperature: {settings.temperature.toFixed(1)}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Lower = focused and predictable. Higher = more varied and creative.
          </p>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => onChange({ ...settings, temperature: parseFloat(e.target.value) })}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsPanel