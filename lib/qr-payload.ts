// lib/qr-payload.ts

export type QRCategory = 'contact' | 'business' | 'payments' | 'files' | 'links';

export type QRType =
  // Contact & Social
  | 'url'
  | 'text'
  | 'vcard'
  | 'whatsapp'
  | 'telegram'
  | 'messenger'
  | 'facetime'
  | 'zoom'
  | 'phone'
  | 'sms'
  | 'email'
  | 'social'
  // Business & Media
  | 'business'
  | 'googleReview'
  | 'menu'
  | 'app'
  | 'event'
  | 'coupon'
  | 'feedback'
  // Payments & Donations
  | 'upi'
  | 'paypal'
  | 'crypto'
  | 'pix'
  // Files & Access
  | 'wifi'
  | 'location'
  | 'pdf'
  | 'images'
  | 'video'
  | 'mp3'
  | 'pincode';

export interface QRPayloadData {
  // Links & Basic
  url?: string;
  text?: string;
  pinCode?: string;

  // Phone / SMS / WhatsApp / Telegram / Messenger / FaceTime
  phone?: string;
  message?: string;
  username?: string;

  // Email
  email?: string;
  subject?: string;
  body?: string;

  // Zoom
  zoomId?: string;
  zoomPass?: string;

  // WiFi
  ssid?: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;

  // vCard & Business Profile
  firstName?: string;
  lastName?: string;
  organization?: string;
  title?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  website?: string;

  // Payments (UPI, PayPal, Crypto, PIX)
  upiId?: string;
  upiName?: string;
  upiAmount?: string;
  upiNote?: string;
  paypalUser?: string;
  paypalAmount?: string;
   paypalCurrency?: string;
  cryptoType?: 'bitcoin' | 'ethereum' | 'solana' | 'usdt';
  cryptoAddress?: string;
  cryptoAmount?: string;
  pixKey?: string;
  pixName?: string;
  pixCity?: string;
  pixAmount?: string;

  // Location
  latitude?: string;
  longitude?: string;
  locationQuery?: string;

  // Event
  eventTitle?: string;
  eventLocation?: string;
  eventStart?: string;
  eventEnd?: string;
  eventDescription?: string;

  // App Download & Social
  appPlatform?: 'android' | 'ios' | 'both';
  appId?: string;
  iosUrl?: string;
  socialNetwork?: 'instagram' | 'tiktok' | 'youtube' | 'x' | 'linkedin' | 'facebook' | 'spotify';
  socialHandle?: string;

  // Business / Review / Menu / Coupon / Files
  googlePlaceId?: string;
  menuUrl?: string;
  couponCode?: string;
  couponDiscount?: string;
  fileUrl?: string;
}

export function generatePayload(type: QRType, d: QRPayloadData): string {
  switch (type) {
    case 'url':
      return d.url?.trim() || 'https://qrgenerato.com';

    case 'text':
      return d.text || 'Hello from QR Generato';

    case 'pincode':
      return d.pinCode || '000000';

    case 'phone':
      return `tel:${(d.phone || '').replace(/\s+/g, '')}`;

    case 'facetime':
      return `facetime:${(d.phone || d.email || '').replace(/\s+/g, '')}`;

    case 'sms':
      return `SMSTO:${(d.phone || '').replace(/\s+/g, '')}:${d.message || ''}`;

    case 'whatsapp': {
      const cleanPhone = (d.phone || '').replace(/[^\d]/g, '');
      const textParam = d.message ? `?text=${encodeURIComponent(d.message)}` : '';
      return `https://wa.me/${cleanPhone}${textParam}`;
    }

    case 'telegram': {
      const user = (d.username || '').replace(/^@/, '').trim();
      return `https://t.me/${user}`;
    }

    case 'messenger': {
      const user = (d.username || '').trim();
      return `https://m.me/${user}`;
    }

    case 'zoom': {
      if (d.url && d.url.startsWith('http')) return d.url;
      const id = (d.zoomId || '').replace(/\s+/g, '');
      const pwd = d.zoomPass ? `?pwd=${encodeURIComponent(d.zoomPass)}` : '';
      return `https://zoom.us/j/${id}${pwd}`;
    }

    case 'email': {
      const sub = d.subject ? `subject=${encodeURIComponent(d.subject)}` : '';
      const body = d.body ? `body=${encodeURIComponent(d.body)}` : '';
      const query = [sub, body].filter(Boolean).join('&');
      return `mailto:${d.email || ''}${query ? `?${query}` : ''}`;
    }

    case 'wifi': {
      const enc = d.encryption || 'WPA';
      const hidden = d.hidden ? 'true' : 'false';
      return `WIFI:T:${enc};S:${d.ssid || ''};P:${d.password || ''};H:${hidden};;`;
    }

    case 'vcard':
    case 'business': {
      const fn = `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.organization || 'Contact';
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${d.lastName || ''};${d.firstName || ''};;;`,
        `FN:${fn}`,
        d.organization ? `ORG:${d.organization}` : '',
        d.title ? `TITLE:${d.title}` : '',
        d.phone ? `TEL;TYPE=CELL:${d.phone}` : '',
        d.email ? `EMAIL:${d.email}` : '',
        d.website || d.url ? `URL:${d.website || d.url}` : '',
        d.street || d.city ? `ADR;TYPE=WORK:;;${d.street || ''};${d.city || ''};;${d.zip || ''};${d.country || ''}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'upi': {
      const params = new URLSearchParams();
      params.set('pa', d.upiId || 'merchant@upi');
      if (d.upiName) params.set('pn', d.upiName);
      if (d.upiAmount) params.set('am', d.upiAmount);
      if (d.upiNote) params.set('tn', d.upiNote);
      params.set('cu', 'INR');
      return `upi://pay?${params.toString()}`;
    }

    case 'paypal': {
      const user = (d.paypalUser || '').replace(/^@/, '').trim();
      const amt = d.paypalAmount ? `/${d.paypalAmount}${d.paypalCurrency || 'USD'}` : '';
      return `https://paypal.me/${user}${amt}`;
    }

    case 'crypto': {
      const coin = d.cryptoType || 'bitcoin';
      const addr = d.cryptoAddress || '';
      const amt = d.cryptoAmount ? `?amount=${encodeURIComponent(d.cryptoAmount)}` : '';
      return `${coin}:${addr}${amt}`;
    }

    case 'pix': {
      // Simplified static Pix key or URL payload
      return d.pixKey || '00020126360014BR.GOV.BCB.PIX';
    }

    case 'location': {
      if (d.locationQuery) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.locationQuery)}`;
      }
      return `geo:${d.latitude || '28.6139'},${d.longitude || '77.2090'}`;
    }

    case 'googleReview': {
      if (d.url && d.url.startsWith('http')) return d.url;
      return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(d.googlePlaceId || '')}`;
    }

    case 'event': {
      const formatDt = (s?: string) => (s ? s.replace(/[-:]/g, '').split('.')[0] + 'Z' : '20261201T100000Z');
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${d.eventTitle || 'Event'}`,
        d.eventLocation ? `LOCATION:${d.eventLocation}` : '',
        d.eventDescription ? `DESCRIPTION:${d.eventDescription}` : '',
        `DTSTART:${formatDt(d.eventStart)}`,
        `DTEND:${formatDt(d.eventEnd)}`,
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'app': {
      if (d.appPlatform === 'ios') {
        return d.iosUrl || `https://apps.apple.com/app/id${d.appId || ''}`;
      }
      return `https://play.google.com/store/apps/details?id=${d.appId || 'com.instagram.android'}`;
    }

    case 'social': {
      const handle = (d.socialHandle || '').replace(/^@/, '').trim();
      const map: Record<string, string> = {
        instagram: `https://instagram.com/${handle}`,
        tiktok: `https://tiktok.com/@${handle}`,
        youtube: `https://youtube.com/@${handle}`,
        x: `https://x.com/${handle}`,
        linkedin: `https://linkedin.com/in/${handle}`,
        facebook: `https://facebook.com/${handle}`,
        spotify: `https://open.spotify.com/artist/${handle}`,
      };
      return map[d.socialNetwork || 'instagram'] || `https://instagram.com/${handle}`;
    }

    case 'coupon':
      return d.url || `COUPON:${d.couponCode || 'SAVE20'} (${d.couponDiscount || '20% OFF'})`;

    case 'menu':
    case 'pdf':
    case 'images':
    case 'video':
    case 'mp3':
    case 'feedback':
      return d.fileUrl || d.menuUrl || d.url || 'https://qrgenerato.com';

    default:
      return d.url || 'https://qrgenerato.com';
  }
}