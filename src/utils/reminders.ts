export function parseReminderTime(reminderTime: string) {
  const [rawHour, rawMinute] = reminderTime.split(':').map(Number);
  const hour = Number.isFinite(rawHour) ? Math.min(Math.max(rawHour, 0), 23) : 21;
  const minute = Number.isFinite(rawMinute) ? Math.min(Math.max(rawMinute, 0), 59) : 0;
  return { hour, minute };
}

export function reminderTimeToDate(reminderTime: string) {
  const { hour, minute } = parseReminderTime(reminderTime);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function formatReminderTime(reminderTime: string) {
  const { hour, minute } = parseReminderTime(reminderTime);
  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}

export function hasReminderTimePassed(reminderTime: string, date = new Date()) {
  const { hour, minute } = parseReminderTime(reminderTime);
  return date.getHours() > hour || (date.getHours() === hour && date.getMinutes() >= minute);
}
