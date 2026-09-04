export type ProductLaunchApiEnvelope = {
  statusCode?: number;
  statusMessage?: string;
  resultData?: unknown;
};

export type ProductLaunchResult = {
  launchUrl: string;
};
