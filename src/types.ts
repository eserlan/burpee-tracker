export type Entry = {
  id: string;
  timestamp: string;
  count: 10;
};

export type Settings = {
  dailyGoal: number;
};

export type ExportBlobV1 = {
  schemaVersion: 1;
  exportedAt: string;
  settings: Settings;
  entries: Entry[];
};
