import { describe, it, expect } from 'vitest';
import { generateHeuristicResponse, generateHeuristicIdeas } from '../services/heuristicAI';
import { SEED_EVENTS } from '../data/seedEvents';

describe('Heuristic Intelligence Engine Suite', () => {
  const weddingPlan = SEED_EVENTS.wedding;
  const birthdayPlan = SEED_EVENTS.birthday;
  const communityPlan = SEED_EVENTS.community;

  it('generates budget advice and an action proposal for cost reduction queries', () => {
    const res = generateHeuristicResponse('How do I cut cost from my wedding budget?', weddingPlan);
    expect(res.text).toContain('Strategic Budget Analysis');
    expect(res.actionProposal).toBeDefined();
    expect(res.actionProposal?.actionType).toBe('add_budget_item');
    expect(res.suggestedPrompts && res.suggestedPrompts.length).toBeGreaterThan(0);
  });

  it('provides timeline conflict and buffer checks for schedule queries', () => {
    const res = generateHeuristicResponse('Review my run of show timeline schedule', weddingPlan);
    expect(res.text).toContain('Run-of-Show & Timeline Optimization');
    expect(res.actionProposal?.actionType).toBe('add_milestone');
  });

  it('tailors recommendations specifically to birthday persona', () => {
    const res = generateHeuristicResponse('What should I do for party decor and music?', birthdayPlan);
    expect(res.text.length).toBeGreaterThan(50);
  });

  it('tailors recommendations specifically to community festival persona', () => {
    const res = generateHeuristicResponse('How to manage budget and permits?', communityPlan);
    expect(res.text).toContain('Budget');
  });

  it('synthesizes bespoke ideas for menu, entertainment, and DIY hacks', () => {
    const menuIdeas = generateHeuristicIdeas('menu', weddingPlan);
    expect(menuIdeas.length).toBeGreaterThan(0);
    expect(menuIdeas[0].category).toBe('menu');

    const diyIdeas = generateHeuristicIdeas('diy_hack', weddingPlan);
    expect(diyIdeas.length).toBeGreaterThan(0);
    expect(diyIdeas[0].category).toBe('diy_hack');
  });
});
