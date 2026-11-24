import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { track } from '@vercel/analytics';
import { trackEvent, trackClick } from '@/lib/analytics';
import { POST } from '@/app/api/telemetry/route';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

describe('Analytics e Telemetria (#67)', () => {
  const originalVercelEnv = process.env.VERCEL;

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'sendBeacon', {
      value: vi.fn(() => true),
      configurable: true,
    });
  });

  afterEach(() => {
    process.env.VERCEL = originalVercelEnv;
  });

  it('envia evento de clique com contexto para Vercel Analytics e sendBeacon', () => {
    trackClick('parceiro-ru', 'Restaurante Universitario', 'https://unicamp.br', {
      course: 'bsi',
      campus: 'FT',
      stage: 'calouro',
    });

    expect(track).toHaveBeenCalledWith('interaction_click', {
      topicId: 'parceiro-ru',
      topicTitle: 'Restaurante Universitario',
      dwellTimeSeconds: 0,
      isMobile: false,
      scrollDepthPct: 0,
      course: 'bsi',
      campus: 'FT',
      stage: 'calouro',
      targetHref: 'https://unicamp.br',
    });

    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    expect(navigator.sendBeacon).toHaveBeenCalledWith(
      '/api/telemetry',
      expect.any(Blob)
    );
  });

  it('envia evento de leitura sem interacao como topic_view', () => {
    trackEvent({
      topicId: 'calendario',
      topicTitle: 'Calendario Academico',
      dwellTimeSeconds: 12,
      isMobile: true,
      scrollDepthPct: 80,
      interacted: false,
    });

    expect(track).toHaveBeenCalledWith('topic_view', {
      topicId: 'calendario',
      topicTitle: 'Calendario Academico',
      dwellTimeSeconds: 12,
      isMobile: true,
      scrollDepthPct: 80,
    });
  });

  it('POST /api/telemetry retorna 400 para payload invalido', async () => {
    const req = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicTitle: 'Sem id' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('POST /api/telemetry responde 200 ephemeral em ambiente Vercel sem gravar em disco', async () => {
    process.env.VERCEL = '1';

    const req = new Request('http://localhost/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId: 'quiz-inicio',
        topicTitle: 'Quiz de Boas Vindas',
        dwellTimeSeconds: 5,
        isMobile: true,
        scrollDepthPct: 50,
        interacted: true,
        interactionType: 'click',
        campus: 'FCA',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      success: true,
      persisted: 'ephemeral',
      count: 1,
    });
  });
});
