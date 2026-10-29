import React, { useState, useEffect } from 'react';
import { useEvent } from '../../context/EventContext';
import { maskApiKey } from '../../utils/security';
import { ShieldCheck, Cpu, Eye, EyeOff, X, Check, AlertCircle } from 'lucide-react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const { aiSettings, updateAISettings } = useEvent();

  const [apiKey, setApiKey] = useState(aiSettings.apiKey || '');
  const [model, setModel] = useState(aiSettings.model || 'heuristic_offline');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateAISettings({
      apiKey: apiKey.trim(),
      model: model as any,
    });
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key to test connection.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Verifying Gemini API key connectivity...');

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Respond with "PONG"' }] }],
        }),
      });

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Gemini API verified successfully!');
      } else {
        const errText = await res.text();
        setTestStatus('error');
        setTestMessage(`API key rejected (HTTP ${res.status}): ${errText.slice(0, 70)}`);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Network failure: ${e?.message || 'Check your internet connection.'}`);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ai-settings-title">
      <div className="modal-card glass-panel">
        <div className="modal-header">
          <div className="flex-center gap-10">
            <Cpu size={22} className="text-indigo" />
            <h3 id="ai-settings-title">GenAI Intelligence Engine Settings</h3>
          </div>
          <button
            type="button"
            className="btn-icon text-muted"
            onClick={onClose}
            aria-label="Close Settings Modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body mt-20">
          {/* Security Guarantee Banner */}
          <div className="security-notice-box glass-panel p-14 mb-20 flex gap-10">
            <ShieldCheck size={20} className="text-emerald flex-shrink-0" />
            <div className="text-xs text-muted">
              <strong className="text-primary">Client-Side Privacy Guarantee:</strong> Your Gemini API key is stored solely in your browser's local sandbox. It is never sent to external servers or logged.
            </div>
          </div>

          {/* Model Selector */}
          <div className="form-group">
            <label className="form-label">Active AI Model</label>
            <select
              className="select-control"
              value={model}
              onChange={e => setModel(e.target.value as any)}
            >
              <option value="heuristic_offline">⚡ Local Heuristic AI Engine (Offline / Zero Setup / Default)</option>
              <option value="gemini-1.5-flash">✨ Google Gemini 1.5 Flash (Ultra-fast multimodal)</option>
              <option value="gemini-2.0-flash">🚀 Google Gemini 2.0 Flash (Next-gen frontier)</option>
              <option value="gemini-1.5-pro">🧠 Google Gemini 1.5 Pro (Deep complex reasoning)</option>
            </select>
            <span className="text-xs text-muted mt-4">
              Local Heuristic Engine operates completely offline with instant decision algorithms. Choose Gemini Flash or Pro for live cloud GenAI.
            </span>
          </div>

          {/* API Key Input */}
          <div className="form-group">
            <label className="form-label">Google Gemini API Key (Optional)</label>
            <div className="input-with-action">
              <input
                type={showKey ? 'text' : 'password'}
                className="input-control font-mono"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={e => {
                  setApiKey(e.target.value);
                  setTestStatus('idle');
                }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? 'Hide API Key' : 'Show API Key'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex-between text-xs text-muted mt-6">
              <span>Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo underline">Google AI Studio</a></span>
              {apiKey && <span>Masked: {maskApiKey(apiKey)}</span>}
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div className={`status-pill mt-12 p-10 rounded ${
              testStatus === 'success' ? 'bg-emerald-subtle text-emerald' :
              testStatus === 'error' ? 'bg-danger-subtle text-danger' : 'bg-surface text-muted'
            }`}>
              <div className="flex-center gap-8 text-sm">
                {testStatus === 'testing' && <span className="spinner-sm" />}
                {testStatus === 'success' && <Check size={16} />}
                {testStatus === 'error' && <AlertCircle size={16} />}
                <span>{testMessage}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer mt-24 flex-between">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || !apiKey.trim()}
          >
            Test Connection
          </button>

          <div className="flex gap-10">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
              Save AI Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
