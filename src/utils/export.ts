import { FullEventPlan, RunOfShowItem, MilestoneItem } from '../types';
import { formatDate, formatTime } from './formatters';

/**
 * Generate standard iCalendar (.ics) format file content from Run-of-Show and Milestones
 */
export function generateICalendarData(plan: FullEventPlan): string {
  const { event, runOfShow, milestones } = plan;
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Celebrio AI//Event Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${event.title}`,
    `X-WR-TIMEZONE:UTC`,
  ];

  // Helper to format date + time into iCal format: YYYYMMDDTHHMMSS
  const parseDateTime = (dateStr: string, timeStr: string): string => {
    const cleanDate = dateStr.replace(/-/g, '');
    const cleanTime = (timeStr || '09:00').replace(':', '') + '00';
    return `${cleanDate}T${cleanTime}`;
  };

  // Add Run-of-Show Items as Calendar Events
  runOfShow.forEach((item: RunOfShowItem) => {
    const dtStart = parseDateTime(event.targetDate, item.startTime);
    const dtEnd = parseDateTime(event.targetDate, item.endTime);
    icsLines.push(
      'BEGIN:VEVENT',
      `UID:ros-${item.id}@celebrio.ai`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${event.title}: ${item.title}`,
      `DESCRIPTION:Lead: ${item.leadPerson}. Notes: ${item.notes || 'None'}`,
      `LOCATION:${item.location || event.venueName}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  // Add Key Milestones as all-day events
  milestones.filter(m => !m.completed).forEach((milestone: MilestoneItem) => {
    const cleanDate = milestone.targetDate.replace(/-/g, '');
    icsLines.push(
      'BEGIN:VEVENT',
      `UID:milestone-${milestone.id}@celebrio.ai`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `SUMMARY:Milestone Deadline: ${milestone.title}`,
      `DESCRIPTION:Priority: ${milestone.priority.toUpperCase()}. ${milestone.description || ''}`,
      'STATUS:TENTATIVE',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Run-of-Show as Print-ready Text / Markdown Sheet
 */
export function generateRunOfShowSheet(plan: FullEventPlan): string {
  const { event, runOfShow } = plan;
  let doc = `========================================================================\n`;
  doc += `EVENT RUN-OF-SHOW COORDINATOR SHEET: ${event.title.toUpperCase()}\n`;
  doc += `Date: ${formatDate(event.targetDate)} | Location: ${event.venueName}, ${event.city}\n`;
  doc += `Lead Coordinator: Celebrio AI Operations Team\n`;
  doc += `========================================================================\n\n`;

  doc += `TIME        | ACTIVITY / STAGE                         | LOCATION           | LEAD\n`;
  doc += `------------+------------------------------------------+--------------------+--------------\n`;

  runOfShow.forEach(item => {
    const timeRange = `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`.padEnd(11, ' ');
    const title = item.title.padEnd(40, ' ');
    const location = item.location.padEnd(18, ' ');
    const lead = item.leadPerson;
    doc += `${timeRange} | ${title} | ${location} | ${lead}\n`;
    if (item.notes) {
      doc += `            > Note: ${item.notes}\n`;
    }
  });

  doc += `\n========================================================================\n`;
  doc += `Emergency Contacts & Key Vendors on Site:\n`;
  plan.vendors.filter(v => v.contractSigned).forEach(v => {
    doc += `* ${v.category} (${v.name}): Contact: ${v.contactName || 'Main Desk'} | Phone: ${v.phone || 'N/A'}\n`;
  });
  doc += `========================================================================\n`;

  return doc;
}
