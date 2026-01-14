export const ROLLOVER_HOUR = 4;

const pad = (value: number) => value.toString().padStart(2, '0');

export const trainingDayKey = (date: Date): string => {
  const local = new Date(date);
  if (local.getHours() < ROLLOVER_HOUR) {
    local.setDate(local.getDate() - 1);
  }
  const year = local.getFullYear();
  const month = pad(local.getMonth() + 1);
  const day = pad(local.getDate());
  return `${year}-${month}-${day}`;
};

export const todayKey = (): string => trainingDayKey(new Date());
