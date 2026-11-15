// lib/landing-content.ts
// Unique, page-specific copy for each QR landing route. Without it every route renders the same
// studio page with only a different <title>, which search engines treat as near-duplicate content.

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingContent {
  /** Section heading (h2) shown below the studio */
  title: string;
  intro: string[];
  steps: { title: string; text: string }[];
  uses: string[];
  tips: string[];
  faqs: LandingFaq[];
}

export type LandingKey = 'wifi' | 'upi' | 'paypal' | 'whatsapp' | 'vcard' | 'pdf' | 'crypto';

export const LANDING_CONTENT: Record<LandingKey, LandingContent> = {
  wifi: {
    title: 'How to Make a WiFi QR Code',
    intro: [
      'A WiFi QR code lets guests join your network by pointing their phone camera at it — no typing long passwords, no spelling mistakes.',
      'The network name, password and security type are stored inside the code itself, so it works offline and never expires.',
    ],
    steps: [
      { title: 'Enter your network', text: 'Type your WiFi name (SSID) exactly as it appears on your phone, then your password.' },
      { title: 'Pick the security type', text: 'Most home and office routers use WPA/WPA2. Choose “No password” for open networks.' },
      { title: 'Style and print', text: 'Add a frame such as “Scan for WiFi”, then download a PNG for printing or an SVG for large signs.' },
    ],
    uses: ['Cafés and restaurants', 'Hotel rooms and Airbnb guests', 'Office reception and meeting rooms', 'Home guest WiFi'],
    tips: [
      'Special characters like ; , : and " in your network name or password are handled automatically.',
      'If you change your WiFi password, create and print a new code — the old one will stop working.',
      'Print at least 3 × 3 cm so phones can scan it from a table.',
    ],
    faqs: [
      { q: 'Do WiFi QR codes work on iPhone and Android?', a: 'Yes. The built-in camera on iPhone (iOS 11+) and most Android phones recognises WiFi QR codes and offers to join the network.' },
      { q: 'Is it safe to share my WiFi with a QR code?', a: 'The code contains your password, so only display it where you would share the password anyway. For visitors, use a separate guest network.' },
      { q: 'Does a WiFi QR code expire?', a: 'No. It is a static code — it keeps working as long as your network name and password stay the same.' },
    ],
  },

  upi: {
    title: 'Create a UPI QR Code for Payments',
    intro: [
      'Generate a UPI payment QR code that customers can scan with Google Pay, PhonePe, Paytm, BHIM or any UPI app to pay you directly.',
      'Payments go straight to your bank account through your UPI ID. There are no fees from us and nothing is stored on our servers.',
    ],
    steps: [
      { title: 'Add your UPI ID', text: 'Enter your UPI ID (for example name@okaxis) and the name customers should see.' },
      { title: 'Set an amount (optional)', text: 'Leave the amount empty for a reusable counter QR, or fix it for a specific bill.' },
      { title: 'Download a payment stand', text: 'Use the UPI Stand frame or a template, then print it for your shop counter.' },
    ],
    uses: ['Shop and kirana counters', 'Street food stalls', 'Freelancer invoices', 'Donations and events'],
    tips: [
      'Always test the code with a ₹1 payment from your own phone before printing.',
      'Keep a plain, high-contrast design for payment codes — they are scanned in a hurry.',
      'A note (like “Order Payment”) appears in the customer’s UPI app.',
    ],
    faqs: [
      { q: 'Which apps can scan this UPI QR code?', a: 'Any UPI app: Google Pay, PhonePe, Paytm, BHIM, Amazon Pay and banking apps that support UPI.' },
      { q: 'Is there a fee for using this UPI QR generator?', a: 'No. Creating the code is free and payments go directly through UPI to your bank account.' },
      { q: 'Can I set a fixed amount?', a: 'Yes. Enter an amount and the customer’s app will pre-fill it. Leave it empty to let customers type any amount.' },
    ],
  },

  paypal: {
    title: 'Make a PayPal QR Code',
    intro: [
      'Turn your PayPal.me link into a QR code so customers and clients anywhere in the world can pay you in a couple of taps.',
      'You can add a fixed amount and currency, or leave it open so the payer chooses the amount.',
    ],
    steps: [
      { title: 'Enter your PayPal.me username', text: 'Use the name from your paypal.me link — without the “paypal.me/” part.' },
      { title: 'Add amount and currency', text: 'Optional. Useful for invoices, tickets or fixed-price products.' },
      { title: 'Download and share', text: 'Print it on invoices and flyers, or add it to digital receipts and slides.' },
    ],
    uses: ['Freelance and client invoices', 'Market stalls and pop-up shops', 'Tips and donations', 'Event tickets'],
    tips: [
      'Make sure PayPal.me is enabled on your PayPal account before printing.',
      'The QR opens a normal PayPal.me page, so payers need internet and a PayPal account or card.',
    ],
    faqs: [
      { q: 'Do I need a PayPal Business account?', a: 'No. Any PayPal account with a PayPal.me link works.' },
      { q: 'Can I accept other currencies?', a: 'Yes. Choose the currency when you add an amount; PayPal handles conversion for the payer.' },
    ],
  },

  whatsapp: {
    title: 'Create a WhatsApp QR Code',
    intro: [
      'A WhatsApp QR code opens a chat with your number — with an optional pre-filled message — the moment someone scans it.',
      'It is the fastest way for customers to message your business without saving your number first.',
    ],
    steps: [
      { title: 'Enter your number', text: 'Include the country code, for example 91 for India or 1 for the US. Spaces and symbols are removed automatically.' },
      { title: 'Write a greeting', text: 'Add the message customers will see ready to send, such as “Hi, I’d like to order”.' },
      { title: 'Print or share', text: 'Place it on packaging, shop windows, business cards or your website.' },
    ],
    uses: ['Customer support and orders', 'Restaurant takeaway', 'Real estate and service enquiries', 'Business cards'],
    tips: ['Use the WhatsApp Business app to set up automatic replies for people who scan.', 'Test the code to make sure the country code is correct.'],
    faqs: [
      { q: 'Does it work with WhatsApp Business?', a: 'Yes. The code uses the standard wa.me link, which works with both WhatsApp and WhatsApp Business.' },
      { q: 'Do people need to save my number?', a: 'No. Scanning opens the chat directly, without adding you to their contacts.' },
    ],
  },

  vcard: {
    title: 'Make a vCard QR Code (Digital Business Card)',
    intro: [
      'A vCard QR code saves your name, phone, email and company straight into someone’s contacts when they scan it.',
      'Put it on business cards, name badges or email signatures — or pick one of our printable card layouts and download it ready to print.',
    ],
    steps: [
      { title: 'Fill in your details', text: 'Add your name, phone, email and organisation. Only the fields you fill in are included.' },
      { title: 'Choose a design', text: 'Use a template, add your logo, or place the QR on a business card layout from the Cards tab.' },
      { title: 'Print or share', text: 'Download a 2000px PNG for print or an SVG for professional printers.' },
    ],
    uses: ['Business cards', 'Conference badges', 'Email signatures', 'Reception desks and brochures'],
    tips: ['Fewer fields make a simpler code that scans faster from small cards.', 'Keep at least 2 cm of QR size on printed business cards.'],
    faqs: [
      { q: 'Will the contact save automatically?', a: 'Phones show a “Add contact” prompt with your details filled in; the person taps once to save.' },
      { q: 'Can I update my details later?', a: 'This is a static code, so new details need a new QR. The upside: it never expires and needs no subscription.' },
    ],
  },

  pdf: {
    title: 'Create a QR Code for a PDF or Menu',
    intro: [
      'Link a QR code to your PDF menu, brochure, catalogue or price list so people can open it on their phone instantly.',
      'Upload your PDF to any file host (Google Drive, Dropbox or your website), paste the public link here, and download the code.',
    ],
    steps: [
      { title: 'Get a public link', text: 'Upload the PDF and copy a link that anyone can open without signing in.' },
      { title: 'Paste and style', text: 'Paste the link, then pick the Cafe or Menu frames, or the Restaurant Menu card.' },
      { title: 'Print on tables', text: 'Download a high-resolution PNG for table tents, stickers or posters.' },
    ],
    uses: ['Restaurant and café menus', 'Product catalogues', 'Event programmes', 'Instruction manuals'],
    tips: [
      'If you host the PDF on your own site, you can replace the file later and keep the same QR code.',
      'Check the link opens in a private browser window before printing.',
    ],
    faqs: [
      { q: 'Do you store my PDF?', a: 'No. You host the file wherever you like; the QR code only contains its link.' },
      { q: 'Can I change the menu without reprinting?', a: 'Yes, as long as the new file keeps the same link (for example, replacing the file on your own website).' },
    ],
  },

  crypto: {
    title: 'Make a Crypto Wallet QR Code',
    intro: [
      'Create a QR code for your Bitcoin, Ethereum, Solana or USDT wallet address so people can pay you without copying long addresses.',
      'Everything is generated in your browser — your wallet address never touches our servers.',
    ],
    steps: [
      { title: 'Choose the coin', text: 'Select Bitcoin, Ethereum, Solana or Tether (USDT).' },
      { title: 'Paste your address', text: 'Paste your receiving address and, optionally, a fixed amount.' },
      { title: 'Double-check and share', text: 'Scan the code with your own wallet to confirm the address before sharing it.' },
    ],
    uses: ['Accepting crypto payments', 'Donations and tips', 'Invoices for international clients', 'Event and conference booths'],
    tips: [
      'Only share receiving addresses — never a private key or seed phrase.',
      'Make sure the sender uses the same network as your address (for example USDT on Ethereum vs Tron).',
    ],
    faqs: [
      { q: 'Which wallets can scan this code?', a: 'Most mobile wallets (Trust Wallet, MetaMask, Coinbase Wallet, Phantom and others) can read address QR codes.' },
      { q: 'Is it safe?', a: 'A receiving address is public by design. The code is created locally in your browser and nothing is uploaded.' },
    ],
  },
};
