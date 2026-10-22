import { describe, it, expect } from 'vitest';
import { generateICalendarData, generateRunOfShowSheet } from '../utils/export';
import { SEED_EVENTS } from '../data/seedEvents';

describe('Export & Calendar Integration Suite', () => {
  const weddingPlan = SEED_EVENTS.wedding;

  it('generates valid RFC 5545 iCalendar data containing VCALENDAR and VEVENT', () => {
    const ics = generateICalendarData(weddingPlan);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('PRODID:-//Celebrio AI//Event Planner//EN');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain(weddingPlan.event.title);
  });

  it('generates a structured text sheet for day-of event coordinators', () => {
    const sheet = generateRunOfShowSheet(weddingPlan);
    expect(sheet).toContain('EVENT RUN-OF-SHOW COORDINATOR SHEET');
    expect(sheet).toContain(weddingPlan.event.title.toUpperCase());
    expect(sheet).toContain(weddingPlan.event.venueName);
    expect(sheet).toContain('TIME        | ACTIVITY / STAGE');
  });
});
