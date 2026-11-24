'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';

export interface UseTopicTrackerOptions {
  topicId: string;
  topicTitle: string;
  minDwellSeconds?: number;
  course?: string;
  campus?: string;
  stage?: string;
}

export function useTopicTracker({
  topicId,
  topicTitle,
  minDwellSeconds = 2,
  course,
  campus,
  stage,
}: UseTopicTrackerOptions) {
  const elementRef = useRef<HTMLElement | null>(null);
  const visibleStartTimeRef = useRef<number | null>(null);
  const totalDwellSecondsRef = useRef<number>(0);
  const interactedRef = useRef<boolean>(false);
  const interactionTypeRef = useRef<string | undefined>(undefined);
  const hasSentRef = useRef<boolean>(false);

  const calculateScrollDepth = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    if (docHeight <= windowHeight) return 100;
    return Math.min(100, Math.round(((scrollTop + windowHeight) / docHeight) * 100));
  }, []);

  const flushVisibleTime = useCallback(() => {
    if (visibleStartTimeRef.current) {
      const duration = (Date.now() - visibleStartTimeRef.current) / 1000;
      totalDwellSecondsRef.current += duration;
      visibleStartTimeRef.current = null;
    }
  }, []);

  const sendTelemetry = useCallback(
    (forcedInteracted?: boolean, forcedType?: string, targetHref?: string) => {
      if (typeof window === 'undefined') return;

      const isMobile =
        window.innerWidth <= 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
      const scrollDepth = calculateScrollDepth();
      const dwellSeconds = Math.round(totalDwellSecondsRef.current);
      const didInteract = forcedInteracted ?? interactedRef.current;
      const type = forcedType ?? interactionTypeRef.current;

      if (dwellSeconds < minDwellSeconds && !didInteract) {
        return;
      }

      trackEvent({
        topicId,
        topicTitle,
        dwellTimeSeconds: dwellSeconds,
        isMobile,
        scrollDepthPct: scrollDepth,
        interacted: didInteract,
        interactionType: type,
        course,
        campus,
        stage,
        targetHref,
      });

      hasSentRef.current = true;
    },
    [topicId, topicTitle, minDwellSeconds, course, campus, stage, calculateScrollDepth]
  );

  const recordInteraction = useCallback(
    (interactionType = 'click', targetHref?: string) => {
      interactedRef.current = true;
      interactionTypeRef.current = interactionType;
      flushVisibleTime();
      sendTelemetry(true, interactionType, targetHref);
    },
    [flushVisibleTime, sendTelemetry]
  );

  useEffect(() => {
    const targetElement = elementRef.current;
    if (!targetElement || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleStartTimeRef.current = Date.now();
          } else {
            flushVisibleTime();
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(targetElement);

    const flushAndSend = () => {
      flushVisibleTime();
      if (!hasSentRef.current) {
        sendTelemetry();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushAndSend();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flushAndSend);
    window.addEventListener('beforeunload', flushAndSend);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flushAndSend);
      window.removeEventListener('beforeunload', flushAndSend);
      flushVisibleTime();
      if (!hasSentRef.current && totalDwellSecondsRef.current >= minDwellSeconds) {
        sendTelemetry();
      }
    };
  }, [minDwellSeconds, flushVisibleTime, sendTelemetry]);

  return {
    ref: elementRef,
    recordInteraction,
  };
}
