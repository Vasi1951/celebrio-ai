import React, { useState, useRef, useEffect } from 'react';
import { useEvent } from '../../context/EventContext';
import { Sparkles, Send, X, Bot, User, Trash2, ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const {
    chatMessages,
    isChatLoading,
    sendChatMessage,
    applyActionProposal,
    clearChat,
    aiSettings,
  } = useEvent();

  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-fill prompt if passed externally
  useEffect(() => {
    if (externalPrompt) {
      sendChatMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, sendChatMessage, onClearExternalPrompt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isChatLoading) return;
    const text = inputPrompt;
    setInputPrompt('');
    await sendChatMessage(text);
  };

  const handlePromptChipClick = (prompt: string) => {
    sendChatMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <aside
      className="assistant-drawer glass-panel"
      role="complementary"
      aria-label="Celebrio AI Planning Assistant"
    >
      {/* Header */}
      <div className="drawer-header">
        <div className="assistant-identity">
          <div className="bot-avatar">
            <Sparkles size={18} className="text-indigo" />
          </div>
          <div>
            <div className="font-semibold text-primary flex-center gap-6">
              <span>Celebrio AI Copilot</span>
              <span className="badge badge-subtle text-xs">
                {aiSettings.apiKey ? 'Gemini Cloud' : 'Local Heuristic Engine'}
              </span>
            </div>
            <div className="text-xs text-muted">Context-aware planning engine</div>
          </div>
        </div>

        <div className="drawer-header-actions">
          <button
            type="button"
            className="btn-icon text-muted"
            onClick={clearChat}
            title="Clear Chat History"
            aria-label="Clear chat messages"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            className="btn-icon text-muted"
            onClick={onClose}
            aria-label="Close Assistant Drawer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="messages-stream" aria-live="polite" role="log">
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`message-bubble-wrapper ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}
          >
            <div className="message-sender-icon">
              {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>

            <div className="message-content-container">
              <div className="message-text">
                {msg.text.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={idx} className="msg-h4">{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('* **')) {
                    return <li key={idx} className="msg-li">{line.replace('* ', '')}</li>;
                  }
                  if (line.trim().startsWith('> ')) {
                    return <blockquote key={idx} className="msg-quote">{line.replace('> ', '')}</blockquote>;
                  }
                  return line ? <p key={idx} className="msg-p">{line}</p> : <div key={idx} className="h-2" />;
                })}
              </div>

              {/* Action Proposal Widget if provided by AI */}
              {msg.actionProposal && (
                <div className="action-proposal-card glass-panel">
                  <div className="action-proposal-header">
                    <Sparkles size={14} className="text-indigo" />
                    <span className="font-semibold text-sm">Suggested Plan Action</span>
                  </div>
                  <div className="action-proposal-title">{msg.actionProposal.label}</div>

                  {msg.actionProposal.applied ? (
                    <div className="action-applied-indicator">
                      <CheckCircle2 size={15} className="text-emerald" />
                      <span>Applied to Event Plan</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm action-apply-btn"
                      onClick={() => applyActionProposal(msg.actionProposal!)}
                    >
                      <span>Apply to My Plan</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Suggested Prompts Chips */}
              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="suggested-chips-tray">
                  {msg.suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="prompt-chip-btn"
                      onClick={() => handlePromptChipClick(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              <div className="msg-timestamp">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isChatLoading && (
          <div className="message-bubble-wrapper bot-msg">
            <div className="message-sender-icon">
              <Bot size={15} />
            </div>
            <div className="typing-indicator glass-panel">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="typing-text">Analyzing plan context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Form */}
      <form className="drawer-input-form" onSubmit={handleSend}>
        <div className="input-with-button">
          <input
            type="text"
            className="input-control chat-input"
            placeholder="Ask about budget, run-of-show, or speeches..."
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={isChatLoading}
            aria-label="Ask Celebrio AI a question"
            id="chat-input-field"
          />
          <button
            type="submit"
            className="btn btn-primary send-btn"
            disabled={!inputPrompt.trim() || isChatLoading}
            aria-label="Send prompt to assistant"
            id="chat-send-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </aside>
  );
};
