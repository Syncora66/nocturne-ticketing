"use client";

import { useState, type FormEvent } from "react";
import { useSupport } from "@/hooks/useSupport";

export default function SupportTestChat() {
  const { ticketId, messages, sendMessage, loading, error, lastAction } =
    useSupport();
  const [input, setInput] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim() || loading) return;
    const value = input;
    setInput("");
    await sendMessage(value);
  }

  return (
    <div className="mx-auto flex h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-nocturne-gray-dark bg-nocturne-gray">
      <div className="flex items-center justify-between border-b border-nocturne-gray-dark px-4 py-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wide text-nocturne-text">
          AI Support — Test
        </span>
        <div className="flex items-center gap-3 text-xs text-nocturne-text/60">
          {ticketId && <span>ticket: {ticketId.slice(0, 8)}</span>}
          {lastAction && (
            <span className="rounded bg-nocturne-cyan/10 px-2 py-1 font-mono text-nocturne-cyan">
              action: {lastAction}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-nocturne-text/50">
            Aucun message pour l&apos;instant. Écris quelque chose ci-dessous,
            par exemple : « je veux un remboursement pour mon ticket ».
          </p>
        )}

        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-nocturne-rose text-nocturne-white"
                    : "bg-nocturne-gray-dark text-nocturne-white"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-nocturne-gray-dark px-4 py-2 text-sm text-nocturne-text/60">
                <span className="font-mono">L&apos;IA réfléchit...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="border-t border-nocturne-gray-dark px-4 py-2 text-sm text-nocturne-rose">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-nocturne-gray-dark p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écris ton message..."
          disabled={loading}
          className="flex-1 rounded-md border border-nocturne-gray-dark bg-nocturne-black px-4 py-2 text-sm text-nocturne-white placeholder:text-nocturne-text/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nocturne-cyan"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-md bg-nocturne-rose px-5 py-2 font-mono text-xs font-bold uppercase tracking-wide text-nocturne-white transition-colors duration-200 ease-out hover:bg-nocturne-cyan hover:text-nocturne-black disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
