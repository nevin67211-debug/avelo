export const serverHealth = async () => ({
  status: "ok",
  service: "avelo-saas",
  mode: "modular",
});

export const createAnalyticsEvent = async (event: string, payload: Record<string, unknown>) => ({
  event,
  payload,
  createdAt: new Date().toISOString(),
});
