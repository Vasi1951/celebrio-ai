import { FullEventPlan, ActionProposal, GeneratedIdea } from '../types';
import { formatCurrency } from '../utils/formatters';

/**
 * Celebrio Offline Heuristic AI Engine
 * Provides instant, zero-latency, realistic AI planning responses,
 * actionable suggestions, and plan modifications without requiring an API key.
 */

export function generateHeuristicResponse(
  userQuery: string,
  plan: FullEventPlan
): { text: string; actionProposal?: ActionProposal; suggestedPrompts?: string[] } {
  const query = userQuery.toLowerCase().trim();
  const { event, budgetItems } = plan;

  // 1. Budget & Cost Reduction Queries
  if (query.includes('budget') || query.includes('cut cost') || query.includes('save money') || query.includes('cheaper') || query.includes('reduce')) {
    const totalActual = budgetItems.reduce((acc, i) => acc + i.actualCost, 0);
    const variance = event.totalTargetBudget - totalActual;
    const isOver = variance < 0;

    let response = `### 💰 Strategic Budget Analysis for ${event.title}\n\n`;
    response += `* **Target Budget:** ${formatCurrency(event.totalTargetBudget, event.currency)}\n`;
    response += `* **Committed Actuals:** ${formatCurrency(totalActual, event.currency)}\n`;
    response += `* **Remaining Balance:** ${formatCurrency(variance, event.currency)} (${isOver ? '⚠️ Currently Over Budget' : '✅ Within Budget'})\n\n`;

    if (event.eventType === 'wedding') {
      response += `**Top 3 High-Impact Savings Opportunities for Weddings:**\n`;
      response += `1. **Floral Repurposing:** Move ceremony altar florals and ground arrangements to frame the sweetheart table and cake stand (saves approx. $800 - $1,500).\n`;
      response += `2. **Signature Drinks vs. Full Open Bar:** Serve 2 signature craft cocktails + premium beer and wine rather than 20 distinct spirits (saves up to 25% on beverage bills).\n`;
      response += `3. **Digitize RSVPs & Enclosure Cards:** Keep physical invitations to 1 luxurious letterpress card and direct guests to an interactive digital RSVP portal.\n`;
    } else if (event.eventType === 'birthday') {
      response += `**Budget Optimization for Milestone Birthdays:**\n`;
      response += `1. **Appetizer Grazing Stations vs. Sit-Down:** Interactive sliders and street tacos encourage mingling while cutting catering staffing costs by 35%.\n`;
      response += `2. **Smart Lighting Rental:** Rent battery-powered wireless uplights and programmed LED tubes instead of complex truss rigs.\n`;
      response += `3. **Digital Interactive Invites:** Use high-end animated invitations with RSVP tracking instead of printed suites.\n`;
    } else {
      response += `**Municipal & Festival Budget Optimization:**\n`;
      response += `1. **Sponsorship Tiers:** Seek local community bank or credit union banner sponsorships to underwrite stage PA and sanitation costs.\n`;
      response += `2. **Civic Volunteering Credits:** Partner with university honor societies and Rotary clubs for marshal staffing to eliminate security agency fees.\n`;
      response += `3. **Direct Food Truck Revenue Share:** Charge food vendors a 10-15% pitch fee instead of providing catering, turning meals into a revenue center!\n`;
    }

    return {
      text: response,
      actionProposal: {
        actionType: 'add_budget_item',
        label: 'Add $500 Floral Repurposing Credit to Budget',
        payload: {
          id: `b-ai-${Date.now()}`,
          category: 'decor_and_floral',
          name: 'Floral Repurposing Savings Offset',
          estimatedCost: -500,
          actualCost: -500,
          paidAmount: 0,
          paymentStatus: 'paid_in_full',
          notes: 'AI suggested cost reduction through ceremony-to-reception reuse.',
        },
      },
      suggestedPrompts: [
        'How should I prioritize vendor payment deadlines?',
        'What contingency percentage should I keep for this venue?',
        'Suggest signature cocktails to replace open bar spirits',
      ],
    };
  }

  // 2. Timeline & Run-of-Show Inquiries
  if (query.includes('timeline') || query.includes('schedule') || query.includes('run of show') || query.includes('time') || query.includes('conflict')) {
    let response = `### ⏱️ Run-of-Show & Timeline Optimization\n\n`;
    response += `Your event is scheduled for **${event.targetDate}** starting at **${event.startTime}** and concluding at **${event.endTime}**.\n\n`;
    response += `**AI Timeline Quality Checks:**\n`;
    response += `* **Buffer Times:** We noticed key transitions require at least 15 minutes of buffer for guest movement between spaces.\n`;
    response += `* **Photo Golden Hour:** Portrait sessions should ideally start 60 minutes before sunset for optimum natural lighting.\n`;
    response += `* **Vendor Load-Out:** Ensure you have booked at least 90 minutes post-event for teardown to avoid venue overtime penalty fees.\n\n`;

    if (event.eventType === 'wedding') {
      response += `**Pro Tip for Dinner Speeches:** Keep total speeches under 12 minutes combined (Maid of Honor: 3m, Best Man: 3m, Parents: 4m) before entrees are served, so the food stays piping hot!`;
    } else if (event.eventType === 'birthday') {
      response += `**Cake & Toast Placement:** Schedule the birthday cake cutting and toast between 22:00 and 22:30, right before opening the dance floor for peak energy.`;
    } else {
      response += `**Public Flow Management:** Schedule marquee headline acts during mid-afternoon to maintain peak foot traffic throughout artisan vendor booths.`;
    }

    return {
      text: response,
      actionProposal: {
        actionType: 'add_milestone',
        label: 'Add "Send Day-of Timeline to All Vendors" Milestone',
        payload: {
          id: `m-ai-${Date.now()}`,
          title: 'Distribute Final Run-of-Show & Vendor Arrival Grid',
          phase: '2_weeks_prior',
          targetDate: event.targetDate,
          completed: false,
          priority: 'critical',
          category: 'Operations',
        },
      },
      suggestedPrompts: [
        'Check our run-of-show for any timing bottlenecks',
        'Export this schedule to Google Calendar iCal format',
        'What should coordinators carry in their emergency kits?',
      ],
    };
  }

  // 3. Theme, Decor & Aesthetic Queries
  if (query.includes('theme') || query.includes('decor') || query.includes('vibe') || query.includes('color') || query.includes('aesthetic')) {
    let response = `### 🎨 Personalized Aesthetic Curation: "${event.theme}"\n\n`;
    response += `**Target Vibe:** ${event.vibeKeywords.join(' • ')}\n\n`;
    response += `**Curated Design Elements:**\n`;
    response += `* **Lighting Architecture:** Use layered warm lighting (2700K temperature) combining dimmable fairy canopies and amber uplighting to produce a cinematic glow.\n`;
    response += `* **Tactile Materials:** Emphasize organic textures—matte ceramic vessels, velvet table runners, and raw linen napkins that photograph with rich depth.\n`;
    response += `* **Interactive Guest Element:** A custom audio guestbook (vintage rotary phone) or Polaroid memory wall where guests clip instant photos with handwritten notes.\n\n`;
    response += `**Bespoke Theme Suggestion:** *"Golden Hour Glow"* — pairing soft peach, antique gold, forest moss, and cream silk.`;

    return {
      text: response,
      actionProposal: {
        actionType: 'apply_theme',
        label: 'Apply "Golden Hour Glow" Moodboard Palette',
        payload: {
          title: 'Golden Hour Glow',
          tagline: 'Amber radiance, warm velvet, and unforgettable fellowship',
          vibe: 'Warm, luminous, welcoming, and cinematic',
          colorPalette: [
            { name: 'Amber Gold', hex: '#E5A93C', role: 'primary' },
            { name: 'Peach Champagne', hex: '#F3C99F', role: 'secondary' },
            { name: 'Forest Velvet', hex: '#2F4F3E', role: 'accent' },
            { name: 'Soft Cream', hex: '#FAF7F0', role: 'background' },
            { name: 'Midnight Charcoal', hex: '#1E232A', role: 'text' },
          ],
        },
      },
      suggestedPrompts: [
        'Suggest 3 signature cocktail recipes to match this theme',
        'Give me affordable DIY centerpieces for 15 tables',
        'Write an invitation dress code blurb for guests',
      ],
    };
  }

  // 4. Speech, Toast & Words of Welcome
  if (query.includes('speech') || query.includes('toast') || query.includes('vow') || query.includes('words') || query.includes('mc')) {
    let response = `### 🎙️ Personalized Speech & Toast Blueprint\n\n`;
    if (event.eventType === 'wedding') {
      response += `**3-Part Structure for an Unforgettable Wedding Toast (3-4 mins max):**\n\n`;
      response += `1. **The Hook (30s):** Start with an endearing, unexpected memory: *"Most people tell you how Marcus is calm and collected. But the day he met Elena, he called me three times just to ask if his favorite green shirt was too enthusiastic."*\n`;
      response += `2. **The Transformation (2 mins):** Illustrate how they bring out the best in each other with one concrete story showing partnership, generosity, or shared laughter.\n`;
      response += `3. **The Toast (30s):** Raise a glass: *"To Elena and Marcus—may your love always be as bright, generous, and enduring as this luminous room tonight. Cheers!"*`;
    } else if (event.eventType === 'birthday') {
      response += `**Milestone Birthday Roast & Toast Formula:**\n\n`;
      response += `* **The Affectionate Ribbing (1 min):** Mention one classic quirky habit that has defined them over the decades.\n`;
      response += `* **The Heart (1.5 mins):** Speak to how they show up for friends in tough moments.\n`;
      response += `* **The Climax:** Raise a glass to entering the most accomplished, fearless chapter yet!`;
    } else {
      response += `**Opening Civic Welcome Address (2 mins):**\n\n`;
      response += `*"Neighbors, friends, and visitors: Welcome to the Oakridge Autumn Harvest & Arts Festival! Today is a testament to the hands, minds, and creative spirits that make our community a vibrant place to live and grow. Thank you to our volunteers, our local makers, and every one of you who brought your families out today."*`;
    }

    return {
      text: response,
      suggestedPrompts: [
        'Customize this speech for the Maid of Honor',
        'Give me funny icebreaker questions for dinner tables',
        'How should the MC announce the grand entrance?',
      ],
    };
  }

  // 5. General / Adaptive Event Planning Fallback
  let defaultResponse = `### 🌟 Planning Insights for "${event.title}"\n\n`;
  defaultResponse += `I've analyzed your event setup: you have **${plan.budgetItems.length} budget items**, **${plan.milestones.length} milestones**, and **${plan.vendors.length} vendors tracked**.\n\n`;
  defaultResponse += `**Recommended Next Action:**\n`;
  const uncompletedMilestones = plan.milestones.filter(m => !m.completed);
  if (uncompletedMilestones.length > 0) {
    const nextMilestone = uncompletedMilestones[0];
    defaultResponse += `* Your next critical milestone is **"${nextMilestone.title}"** (Target: ${nextMilestone.targetDate}). Let me know if you need vendor negotiation scripts or checklist items for this step!\n`;
  }
  defaultResponse += `* You can ask me to re-calculate your budget, generate themed cocktails, write speech outlines, or format an iCal export for coordinators anytime.`;

  return {
    text: defaultResponse,
    suggestedPrompts: [
      'How can I save $2,000 on my budget without sacrificing quality?',
      'Suggest a 5-step signature cocktail menu for our guests',
      'What are the most common day-of emergencies to plan for?',
    ],
  };
}

/**
 * Generate rich bespoke ideas according to user topic
 */
export function generateHeuristicIdeas(
  category: 'theme' | 'menu' | 'entertainment' | 'speech' | 'diy_hack' | 'icebreaker',
  plan: FullEventPlan
): GeneratedIdea[] {
  const { event } = plan;

  if (category === 'menu') {
    return [
      {
        id: `idea-menu-${Date.now()}-1`,
        category: 'menu',
        title: 'Artisan Grazing Table with Local Honeycomb & Cheeses',
        description: 'A 12-foot rustic wooden board layered with aged white cheddar, triple-cream brie, fresh figs, honeycomb slabs, rosemary focaccia, and marcona almonds.',
        tags: [event.eventType, 'Gourmet', 'Interactive', 'Visual Showcase'],
        estimatedCostImpact: 'medium',
        saved: false,
      },
      {
        id: `idea-menu-${Date.now()}-2`,
        category: 'menu',
        title: 'Late-Night Gourmet Slider & Truffle Fry Pass',
        description: 'Delivered at 22:30 right when dance floor energy is peak: mini Wagyu beef sliders with aged gruyere and parmesan truffle fries served in mini paper cones.',
        tags: ['Crowd Pleaser', 'Late Night', 'High Energy'],
        estimatedCostImpact: 'low',
        saved: false,
      },
    ];
  }

  if (category === 'entertainment') {
    return [
      {
        id: `idea-ent-${Date.now()}-1`,
        category: 'entertainment',
        title: 'Vintage Audio Guestbook Station',
        description: 'An authentic retro rotary phone with a built-in micro-recorder. Guests pick up the receiver, hear a recorded message from the hosts, and leave heartfelt voice memos.',
        tags: ['Memories', 'Unique', 'Retro'],
        estimatedCostImpact: 'low',
        saved: false,
      },
      {
        id: `idea-ent-${Date.now()}-2`,
        category: 'entertainment',
        title: 'Live Event Painter or Quick Sketch Caricaturist',
        description: 'An artist painting the entire reception scene live on a 24x36 canvas, creating an heirloom keepsake while providing captivating entertainment for guests.',
        tags: ['Fine Art', 'Keepsake', 'Sophisticated'],
        estimatedCostImpact: 'medium',
        saved: false,
      },
    ];
  }

  if (category === 'diy_hack') {
    return [
      {
        id: `idea-diy-${Date.now()}-1`,
        category: 'diy_hack',
        title: 'Framed Acrylic Welcome Sign with Paint Brush Strokes',
        description: 'Buy a clear $25 24x36 acrylic sheet from hardware store, paint reverse side with sage/gold acrylic brush strokes, and apply white vinyl lettering with a Cricut.',
        tags: ['DIY', 'Modern', 'Saves $150+'],
        estimatedCostImpact: 'free',
        saved: false,
      },
      {
        id: `idea-diy-${Date.now()}-2`,
        category: 'diy_hack',
        title: 'Candlelight Illusion with Glass Hurricanes & LED Pillars',
        description: 'Use moving-wick LED pillar candles inside clear ribbed glass hurricanes. Recreates identical warm luxury romance of wax candles with 100% fire-code compliance.',
        tags: ['Safety', 'Budget Friendly', 'Reusable'],
        estimatedCostImpact: 'low',
        saved: false,
      },
    ];
  }

  // Fallback Theme Ideas
  return [
    {
      id: `idea-thm-${Date.now()}-1`,
      category: 'theme',
      title: 'Botanical Glasshouse & Luminous Candlelight',
      description: 'Lush potted ferns, cascading jasmine vines, brass accents, and over 100 warm pillar candles set against high glass walls.',
      tags: ['Elegant', 'Timeless', 'Atmospheric'],
      estimatedCostImpact: 'medium',
      saved: false,
    },
    {
      id: `idea-thm-${Date.now()}-2`,
      category: 'theme',
      title: 'Modern Minimalist Monochrome & Warm Wood',
      description: 'Clean architectural lines, warm natural oak furniture, sculptural floral ikebana moments, and soft linen drapery.',
      tags: ['Modern', 'Chic', 'High Design'],
      estimatedCostImpact: 'low',
      saved: false,
    },
  ];
}
