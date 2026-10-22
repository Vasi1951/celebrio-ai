import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { GeneratedIdea } from '../../types';
import { generateHeuristicIdeas } from '../../services/heuristicAI';
import { Sparkles, Bookmark, BookmarkCheck, Copy, Check, Palette, Utensils, Music, Mic2, Lightbulb, Smile, Plus } from 'lucide-react';

interface IdeasViewProps {
  onAskAI: (prompt: string) => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({ onAskAI }) => {
  const { plan, saveIdea, removeIdea } = useEvent();
  const { event, themeProposal, savedIdeas } = plan;

  const [activeCategory, setActiveCategory] = useState<'theme' | 'menu' | 'entertainment' | 'speech' | 'diy_hack' | 'icebreaker'>('theme');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [customIdeas, setCustomIdeas] = useState<GeneratedIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Copy color hex
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Generate personalized ideas with AI
  const handleGenerateIdeas = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateHeuristicIdeas(activeCategory, plan);
      setCustomIdeas(generated);
      setIsGenerating(false);
    }, 600);
  };

  const categories = [
    { id: 'theme', label: 'Themes & Decor', icon: Palette },
    { id: 'menu', label: 'Menus & Cocktails', icon: Utensils },
    { id: 'entertainment', label: 'Entertainment', icon: Music },
    { id: 'speech', label: 'Speeches & Toasts', icon: Mic2 },
    { id: 'diy_hack', label: 'DIY Cost-Savers', icon: Lightbulb },
    { id: 'icebreaker', label: 'Guest Icebreakers', icon: Smile },
  ];

  return (
    <div className="ideas-view-container">
      {/* Active Theme & Moodboard Banner */}
      {themeProposal && (
        <div className="theme-showcase-panel glass-panel">
          <div className="theme-banner-header">
            <div>
              <span className="badge badge-primary">Current Event Theme</span>
              <h2 className="theme-title">{themeProposal.title}</h2>
              <p className="theme-tagline">“{themeProposal.tagline}”</p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onAskAI(`Generate a fresh alternative theme and color palette for my ${event.eventType} with vibe: ${event.vibeKeywords.join(', ')}`)}
            >
              <Sparkles size={15} className="text-indigo" />
              <span>Generate Alternative Theme</span>
            </button>
          </div>

          {/* Interactive Color Palette */}
          <div className="palette-container">
            <h4 className="palette-heading">Curated Color Palette</h4>
            <div className="palette-grid">
              {themeProposal.colorPalette.map(color => (
                <div
                  key={color.name}
                  className="color-chip-card"
                  onClick={() => handleCopyHex(color.hex)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Copy color ${color.name} hex code: ${color.hex}`}
                  onKeyDown={e => e.key === 'Enter' && handleCopyHex(color.hex)}
                >
                  <div className="color-swatch" style={{ backgroundColor: color.hex }} />
                  <div className="color-info">
                    <span className="color-name">{color.name}</span>
                    <span className="color-hex font-mono">
                      {copiedHex === color.hex ? (
                        <span className="text-emerald flex-center gap-4">
                          <Check size={12} /> Copied
                        </span>
                      ) : (
                        color.hex
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aesthetic Pillars 3-Col Grid */}
          <div className="theme-pillars-grid mt-20">
            {/* Decor Concepts */}
            <div className="pillar-card">
              <h5>🌿 Signature Decor Concepts</h5>
              <ul className="pillar-list">
                {themeProposal.decorIdeas.map((idea, idx) => (
                  <li key={idx}>• {idea}</li>
                ))}
              </ul>
            </div>

            {/* Food & Beverage */}
            <div className="pillar-card">
              <h5>🍸 Culinary & Signature Drinks</h5>
              <ul className="pillar-list">
                {themeProposal.signatureDrinksOrDishes.map((dish, idx) => (
                  <li key={idx}>• {dish}</li>
                ))}
              </ul>
            </div>

            {/* Music & Atmosphere */}
            <div className="pillar-card">
              <h5>🎵 Music Flow & Atmosphere</h5>
              <ul className="pillar-list">
                {themeProposal.musicAndAtmosphere.map((music, idx) => (
                  <li key={idx}>• {music}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Idea Generator Section */}
      <div className="idea-generator-section glass-panel p-24 mt-28">
        <div className="generator-header">
          <div>
            <h3>GenAI Bespoke Idea Studio</h3>
            <p className="subtext">
              Brainstorm personalized cocktails, unique entertainment, heartfelt speeches, and DIY hacks
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerateIdeas}
            disabled={isGenerating}
            id="btn-brainstorm-ideas"
          >
            <Sparkles size={16} />
            <span>{isGenerating ? 'Synthesizing Ideas...' : 'Generate New Ideas'}</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills-row mt-16" role="tablist">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setCustomIdeas([]);
                }}
                role="tab"
                aria-selected={isActive}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Generated Ideas Grid */}
        <div className="ideas-grid mt-24">
          {(customIdeas.length > 0 ? customIdeas : savedIdeas.filter(i => i.category === activeCategory)).length === 0 ? (
            <div className="p-32 text-center text-muted w-full">
              <Lightbulb size={36} className="mx-auto mb-12 text-muted" />
              <p>Click "Generate New Ideas" above to create bespoke suggestions for {activeCategory}!</p>
            </div>
          ) : (
            (customIdeas.length > 0 ? customIdeas : savedIdeas.filter(i => i.category === activeCategory)).map(idea => {
              const isSaved = savedIdeas.some(i => i.id === idea.id);

              return (
                <div key={idea.id} className="idea-card glass-panel">
                  <div className="idea-header">
                    <span className="badge badge-subtle">{idea.category.toUpperCase()}</span>
                    {idea.estimatedCostImpact && (
                      <span className={`badge ${
                        idea.estimatedCostImpact === 'free' ? 'badge-success' : 'badge-subtle'
                      }`}>
                        {idea.estimatedCostImpact.toUpperCase()} COST
                      </span>
                    )}
                  </div>

                  <h4 className="idea-title">{idea.title}</h4>
                  <p className="idea-description">{idea.description}</p>

                  <div className="idea-tags">
                    {idea.tags.map((tag, idx) => (
                      <span key={idx} className="tag-chip">#{tag}</span>
                    ))}
                  </div>

                  <div className="idea-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${idea.title}\n${idea.description}`);
                        alert('Copied idea to clipboard!');
                      }}
                      title="Copy Idea Details"
                    >
                      <Copy size={14} />
                      <span>Copy</span>
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => (isSaved ? removeIdea(idea.id) : saveIdea(idea))}
                    >
                      {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      <span>{isSaved ? 'Saved' : 'Save Idea'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
