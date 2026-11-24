import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface TelemetryPayload {
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

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'telemetry_events.json');
const MAX_LOCAL_EVENTS = 5000;

function persistTelemetryLocally(eventRecord: TelemetryPayload): {
  persisted: 'local' | 'ephemeral';
  count: number;
} {
  if (process.env.VERCEL === '1') {
    return { persisted: 'ephemeral', count: 1 };
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let currentEvents: TelemetryPayload[] = [];
    if (fs.existsSync(DATA_FILE)) {
      try {
        const rawContent = fs.readFileSync(DATA_FILE, 'utf8');
        currentEvents = rawContent ? JSON.parse(rawContent) : [];
      } catch {
        currentEvents = [];
      }
    }

    currentEvents.push(eventRecord);

    if (currentEvents.length > MAX_LOCAL_EVENTS) {
      currentEvents = currentEvents.slice(-MAX_LOCAL_EVENTS);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(currentEvents, null, 2), 'utf8');
    return { persisted: 'local', count: currentEvents.length };
  } catch {
    // Em ambientes serverless com sistema de arquivos somente leitura, nao retornar erro 500.
    return { persisted: 'ephemeral', count: 1 };
  }
}

export async function POST(req: Request) {
  try {
    const body: TelemetryPayload = await req.json();

    if (!body.topicId || typeof body.dwellTimeSeconds !== 'number') {
      return NextResponse.json({ error: 'Dados invalidos' }, { status: 400 });
    }

    const eventRecord: TelemetryPayload = {
      ...body,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    const result = persistTelemetryLocally(eventRecord);

    return NextResponse.json({
      success: true,
      persisted: result.persisted,
      count: result.count,
    });
  } catch {
    return NextResponse.json({ error: 'Falha ao registrar telemetria' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ total: 0, events: [] });
    }
    const rawContent = fs.readFileSync(DATA_FILE, 'utf8');
    const events = rawContent ? JSON.parse(rawContent) : [];
    return NextResponse.json({ total: events.length, events });
  } catch {
    return NextResponse.json({ total: 0, events: [] });
  }
}
