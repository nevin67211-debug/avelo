export type DbRecord = {
  id: string;
  collection: string;
  createdAt: string;
};

export const dbSeed = {
  analytics: [{ id: "evt-001", collection: "analytics", createdAt: new Date().toISOString() }],
  users: [{ id: "demo-user", collection: "users", createdAt: new Date().toISOString() }],
};
