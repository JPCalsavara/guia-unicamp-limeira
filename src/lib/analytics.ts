import { track } from '@vercel/analytics';

export interface TelemetryEventPayload {
  topicId: string;
  topicTitle: string;
  dwellTimeSeconds: number;
  isMobile: boolean;
  scrollDepthPct: number;
  interacted: boolean;
  interactionType?: string;
  course?: string;
  campus?: string;
  stage?: string;
  targetHref?: string;
  timestamp?: string;
}

export interface TrackContext {
  course?: string;
  campus?: string;
  stage?: string;
}

function detectIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
}

/**
 * Envia evento unificado para o Vercel Analytics e para /api/telemetry.
 */
export function trackEvent(payload: TelemetryEventPayload): void {
  if (typeof window === 'undefined') return;

  const enriched: TelemetryEventPayload = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  try {
    const eventName = enriched.interacted
      ? `interaction_${enriched.interactionType || 'click'}`
      : 'topic_view';

    const properties: Record<string, string | number | boolean> = {
      topicId: enriched.topicId,
      topicTitle: enriched.topicTitle,
      dwellTimeSeconds: enriched.dwellTimeSeconds,
      isMobile: enriched.isMobile,
      scrollDepthPct: enriched.scrollDepthPct,
    };

    if (enriched.course) properties.course = enriched.course;
    if (enriched.campus) properties.campus = enriched.campus;
    if (enriched.stage) properties.stage = enriched.stage;
    if (enriched.targetHref) properties.targetHref = enriched.targetHref;

    track(eventName, properties);
  } catch {
    // Falha no analytics externo nao deve interromper a navegacao.
  }

  const body = JSON.stringify(enriched);
  const payloadBlob = new Blob([body], { type: 'application/json' });

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon('/api/telemetry', payloadBlob);
    return;
  }

  if (typeof fetch === 'function') {
    fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

/**
 * Registra clique explicito em links, cards ou acoes do portal.
 */
export function trackClick(
  topicId: string,
  topicTitle: string,
  targetHref?: string,
  context?: TrackContext
): void {
  trackEvent({
    topicId,
    topicTitle,
    dwellTimeSeconds: 0,
    isMobile: detectIsMobile(),
    scrollDepthPct: 0,
    interacted: true,
    interactionType: 'click',
    targetHref,
    course: context?.course,
    campus: context?.campus,
    stage: context?.stage,
  });
}
