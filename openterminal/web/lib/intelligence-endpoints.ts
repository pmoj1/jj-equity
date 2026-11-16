// Upstream transport contracts remain server-side; no credentials reach widgets.
export const INTELLIGENCE_ENDPOINTS: Record<string, string> = {
  headlines: '/api/news/v1/list-feed-digest?variant=full',
  risk: '/api/intelligence/v1/get-risk-scores',
  earthquakes: '/api/seismology/v1/list-earthquakes',
  maritime: '/api/maritime/v1/get-vessel-snapshot',
  energy: '/api/economic/v1/get-energy-prices',
  shipping: '/api/supply-chain/v1/get-chokepoint-status',
  disruptions: '/api/supply-chain/v1/list-energy-disruptions',
  military: '/api/military/v1/get-theater-posture',
  cyber: '/api/cyber/v1/list-cyber-threats',
};
