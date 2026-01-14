export type Entry = {
  id: string;
  timestamp: string;
  // Each Entry currently always represents a fixed +10 increment.
  // The literal type `10` is intentional; if variable increments are needed
  // in the future, change this to `number` and add appropriate validation.
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
