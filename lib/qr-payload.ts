// lib/qr-payload.ts
export type QRType =
  | 'url'
  | 'text'
  | 'email'
  | 'wifi'
  | 'phone'
  | 'sms'
  | 'vcard'
  | 'social'
  | 'upi'
  | 'event'
  | 'geo'
  | 'appstore';

export interface QRPayloadData {
  url?: string;
  text?: string;
  email?: string;
  subject?: string;
  body?: string;
  ssid?: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  phone?: string;
  sms?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  socialNetwork?: string;
  socialHandle?: string;
  // UPI Payment
  upiId?: string;
  upiName?: string;
  upiAmount?: string;
  upiNote?: string;
  // Calendar Event
  eventTitle?: string;
  eventLocation?: string;
  eventStart?: string;
  eventEnd?: string;
  eventDescription?: string;
  // Geo-Location
  latitude?: string;
  longitude?: string;
  geoQuery?: string;
  // App Store / Play Store
  appPlatform?: 'ios' | 'android' | 'custom';
  appId?: string;
  appCustomUrl?: string;
}

function formatICalDate(dateStr?: string): string {
  if (!dateStr) {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generatePayload(type: QRType, data: QRPayloadData): string {
  switch (type) {
    case 'url':
      return data.url?.trim() || 'https://example.com';
    case 'text':
      return data.text || 'Hello from QR GENERATO!';
    case 'email':
      return `mailto:${data.email || ''}?subject=${encodeURIComponent(data.subject || '')}&body=${encodeURIComponent(data.body || '')}`;
    case 'wifi':
      return `WIFI:T:${data.encryption || 'WPA'};S:${data.ssid || ''};P:${data.password || ''};;`;
    case 'phone':
      return `tel:${data.phone || ''}`;
    case 'sms':
      return `smsto:${data.phone || ''}:${data.sms || ''}`;
    case 'vcard':
      return `BEGIN:VCARD\nVERSION:3.0\nN:${data.lastName || ''};${data.firstName || ''}\nFN:${data.firstName || ''} ${data.lastName || ''}\nORG:${data.organization || ''}\nTEL:${data.phone || ''}\nEMAIL:${data.email || ''}\nEND:VCARD`;
    case 'social': {
      const cleanHandle = (data.socialHandle || 'yourname').replace(/^@/, '');
      const handles: Record<string, string> = {
        tiktok: `https://tiktok.com/@${cleanHandle}`,
        instagram: `https://instagram.com/${cleanHandle}`,
        youtube: `https://youtube.com/@${cleanHandle}`,
        linkedin: `https://linkedin.com/in/${cleanHandle}`,
        facebook: `https://facebook.com/${cleanHandle}`,
        whatsapp: `https://wa.me/${cleanHandle}`,
      };
      return handles[data.socialNetwork || 'tiktok'] || 'https://example.com';
    }
    case 'upi': {
      const pa = encodeURIComponent(data.upiId?.trim() || 'merchant@upi');
      const pn = encodeURIComponent(data.upiName?.trim() || 'Payee');
      let upi = `upi://pay?pa=${pa}&pn=${pn}&cu=INR`;
      if (data.upiAmount && Number(data.upiAmount) > 0) {
        upi += `&am=${encodeURIComponent(data.upiAmount)}`;
      }
      if (data.upiNote?.trim()) {
        upi += `&tn=${encodeURIComponent(data.upiNote.trim())}`;
      }
      return upi;
    }
    case 'event': {
      const dtStart = formatICalDate(data.eventStart);
      const dtEnd = formatICalDate(data.eventEnd || data.eventStart);
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${data.eventTitle || 'Upcoming Event'}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `LOCATION:${data.eventLocation || ''}`,
        `DESCRIPTION:${data.eventDescription || ''}`,
        'END:VEVENT',
      ].join('\n');
    }
    case 'geo': {
      const lat = data.latitude?.trim() || '28.6139';
      const lng = data.longitude?.trim() || '77.2090';
      if (data.geoQuery?.trim()) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.geoQuery.trim())}`;
      }
      return `geo:${lat},${lng}`;
    }
    case 'appstore': {
      if (data.appPlatform === 'ios') {
        return `https://apps.apple.com/app/id${(data.appId || '123456789').replace(/^id/, '')}`;
      } else if (data.appPlatform === 'android') {
        return `https://play.google.com/store/apps/details?id=${data.appId || 'com.example.app'}`;
      }
      return data.appCustomUrl?.trim() || 'https://example.com/app';
    }
    default:
      return 'https://example.com';
  }
}