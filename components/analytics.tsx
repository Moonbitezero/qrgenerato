'use client';

import { useSyncExternalStore } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

/** Hostnames that count as the real site. Preview (*.pages.dev) and localhost visits are not tracked. */
const PRODUCTION_HOSTS = new Set(['qrgenerato.com', 'www.qrgenerato.com']);

const subscribe = () => () => {};
const getHost = () => window.location.hostname;
const getServerHost = () => '';

export default function Analytics({ gaId }: { gaId: string }) {
  const host = useSyncExternalStore(subscribe, getHost, getServerHost);
  return PRODUCTION_HOSTS.has(host) ? <GoogleAnalytics gaId={gaId} /> : null;
}
