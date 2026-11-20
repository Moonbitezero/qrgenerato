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
  /** Extra in-depth sections (h3 + paragraphs) shown after the intro: the bulk of each page's unique copy */
  sections?: { heading: string; paragraphs: string[] }[];
  steps: { title: string; text: string }[];
  uses: string[];
  tips: string[];
  faqs: LandingFaq[];
}

export type LandingKey =
  | 'wifi'
  | 'upi'
  | 'paypal'
  | 'whatsapp'
  | 'vcard'
  | 'pdf'
  | 'crypto'
  | 'animated'
  | 'logo'
  | 'businessCard'
  | 'googleReview'
  | 'instagram'
  | 'youtube'
  | 'dynamic'
  | 'scanner'
  | 'bulk'
  | 'audio'
  | 'image';

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
      { title: 'Print or share', text: 'Download a 3000px PNG for print or an SVG for professional printers.' },
    ],
    uses: ['Business cards', 'Conference badges', 'Email signatures', 'Reception desks and brochures'],
    tips: ['Fewer fields make a simpler code that scans faster from small cards.', 'Keep at least 2 cm of QR size on printed business cards.'],
    faqs: [
      { q: 'Will the contact save automatically?', a: 'Phones show a “Add contact” prompt with your details filled in; the person taps once to save.' },
      { q: 'Can I update my details later?', a: 'This is a static code, so new details need a new QR. The upside: it never expires and needs no subscription.' },
    ],
  },

  pdf: {
    title: 'How to Turn a PDF Into a QR Code',
    intro: [
      'A PDF QR code opens your menu, brochure, catalogue, price list or manual on any phone with one scan. People see a clean page with a PDF viewer and a download button, with no app or sign-in needed.',
      'Upload your PDF here (up to 15 MB) and get the QR code straight away, free. You can replace the PDF later and the printed code keeps working, which is ideal for menus and price lists that change. You can also paste a link to a PDF you already host.',
    ],
    sections: [
      {
        heading: 'What people see when they scan your PDF QR code',
        paragraphs: [
          'Scanning opens a clean page with your PDF’s name, a viewer that shows the pages right in the phone browser and a download button. It works on iPhone, Android, tablets and computers, with no app to install and no account to sign in to. Customers can zoom into a menu, flick through a brochure or save a manual for later.',
          'Because the PDF is hosted for you, you do not need Google Drive sharing settings or your own website. Uploading directly also avoids the common problem of a Drive link that asks people to request access.',
        ],
      },
      {
        heading: 'Restaurant menu QR codes that you can update',
        paragraphs: [
          'Menus change with the seasons, prices and the daily specials. Print the QR code once on table cards, stickers or the window, and whenever the menu changes, upload the new PDF with “Replace file”. Every printed code shows the new menu straight away.',
          'The same works for price lists, timetables, event programmes and product catalogues: anything printed that might need a correction later.',
        ],
      },
      {
        heading: 'Printing tips for PDF QR codes',
        paragraphs: [
          'Print the code at least 2.5 × 2.5 cm (1 inch) for table cards and larger for posters seen from a distance. Keep dark dots on a light background, add a short call to action such as “Scan for menu”, and test the printed code with a couple of phones before a big print run. Download the SVG for professional printing: it stays sharp at any size.',
        ],
      },
    ],
    steps: [
      { title: 'Upload your PDF', text: 'Choose PDF / Brochure and click “Upload a PDF instead of a link”, or paste a link to a PDF that’s already online.' },
      { title: 'Style the code', text: 'Pick a menu or café frame, add your logo and colours, or choose the Restaurant Menu card.' },
      { title: 'Print, then update anytime', text: 'Download a high-resolution PNG or SVG. When the menu changes, use “Replace file”: same QR, new PDF.' },
    ],
    uses: ['Restaurant and café menus', 'Product catalogues and brochures', 'Price lists and rate cards', 'Event programmes and tickets', 'Instruction manuals and warranty cards'],
    tips: [
      'Keep the PDF under a few MB so it opens quickly on mobile data. Compress large scans before uploading.',
      'Give the file a clear name (it appears on the scan page), for example “Dinner menu – November”.',
      'Use “Replace file” instead of making a new code when the menu changes, so nothing needs reprinting.',
    ],
    faqs: [
      { q: 'Can I upload my PDF directly?', a: 'Yes. Upload a PDF of up to 15 MB and the QR code opens it in a viewer with a download button. It’s free and needs no account.' },
      { q: 'Can I change the PDF after printing the QR code?', a: 'Yes. Open My QR Codes and click “Replace file”. The printed QR stays the same and shows the new PDF straight away.' },
      { q: 'How long is my PDF kept?', a: 'As long as people scan it. Files nobody scans for 6 months are deleted automatically, and you can delete yours anytime.' },
      { q: 'Can I see how many people opened it?', a: 'Yes. Each uploaded file shows its scan count and a 7-day chart on the My QR Codes page.' },
      { q: 'Can I use a link instead of uploading?', a: 'Yes. Paste a public link to a PDF on Google Drive, Dropbox or your own website, and the QR code opens that link.' },
      { q: 'Does a PDF QR code work without the internet?', a: 'No. The phone needs mobile data or Wi-Fi to open the PDF, because the file is downloaded when the code is scanned.' },
      { q: 'Can I make a QR code for a restaurant menu?', a: 'Yes. Upload your menu as a PDF, pick a menu frame or the Restaurant Menu card, and print it on table cards or stickers. Use “Replace file” whenever the menu changes.' },
    ],
  },

  crypto: {
    title: 'Make a Crypto Wallet QR Code',
    intro: [
      'Create a QR code for your Bitcoin, Ethereum, Solana or USDT wallet address so people can pay you without copying long addresses.',
      'Everything is generated in your browser — your wallet address never touches our servers.',
    ],
    sections: [
      {
        heading: 'How a crypto QR code works',
        paragraphs: [
          'A crypto QR code stores your public receiving address, so the person paying you scans it with their wallet app instead of copying a long string of letters and numbers by hand. One wrong character in a copied address can send money to the wrong place; scanning removes that risk.',
          'You can also add a fixed amount. Many wallets read it from the code and fill in the payment for the sender, which is useful for invoices, shop counters and event tickets.',
        ],
      },
      {
        heading: 'Bitcoin, Ethereum, Solana and USDT',
        paragraphs: [
          'Choose the coin that matches your wallet address. Bitcoin codes use the standard bitcoin: payment format that almost every wallet understands. For Ethereum and Solana addresses, use the matching coin so the sender’s wallet opens the right network.',
          'With USDT, always tell the sender which network your address is on (for example Ethereum or Tron). Tokens sent on the wrong network may not arrive and can be hard or impossible to recover.',
        ],
      },
      {
        heading: 'Keeping your wallet safe',
        paragraphs: [
          'A receiving address is designed to be shared, but your private key and seed phrase must never be. Never put them in a QR code. Before printing a code or posting it online, scan it with your own wallet to confirm it shows exactly your address.',
          'Your address is turned into a QR code in your browser and is not sent to our server.',
        ],
      },
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
      { q: 'Can I add an amount to a Bitcoin QR code?', a: 'Yes. Enter the amount when you create the code. Most Bitcoin wallets read it and fill in the payment for the sender, who can still check it before sending.' },
      { q: 'Can I put a logo on my crypto QR code?', a: 'Yes. Add a coin logo or your own logo in the Logos tab, choose colours and a frame, and download it as PNG or SVG for free.' },
    ],
  },

  animated: {
    title: 'How to Make an Animated QR Code (GIF & MP4)',
    intro: [
      'An animated QR code moves — light sweeps across it, dots ripple, colours shift — so it catches the eye on screens, social posts and digital signage far better than a flat black square.',
      'QR Generato has 70 free animated effects. The three corner eyes always stay still and sharp, so the code keeps scanning while the rest of it moves. Download it as a GIF, MP4 video or animated SVG with no watermark.',
    ],
    steps: [
      { title: 'Enter your content', text: 'Paste a link or pick any QR type — URL, WiFi, UPI, vCard, WhatsApp and more all work with animation.' },
      { title: 'Pick an effect', text: 'Open the Motion tab and choose from light sweeps, radar, liquid fill, glitch, rainbow, scan lines and more. The preview plays live.' },
      { title: 'Export GIF or MP4', text: 'Download a GIF for websites and chats, an MP4 for Instagram Reels, TikTok and YouTube, or an SVG for web pages.' },
    ],
    uses: ['Instagram Reels, Stories and TikTok', 'Digital signage and TV screens', 'Event slides and live streams', 'Website banners and email headers'],
    tips: [
      'Animated codes are for screens. For print, download a still PNG or SVG of the same design.',
      'Keep strong contrast between the QR colour and the background — subtle effects scan best.',
      'MP4 is smaller and sharper than GIF for long or detailed animations.',
      'Combine an effect with a template or card from the other tabs for a fully branded look.',
    ],
    faqs: [
      { q: 'Do animated QR codes still scan?', a: 'Yes. The finder eyes stay static, and light, colour and shimmer effects keep the full pattern visible the whole time. Reveal-style effects (drop-in, build-up) hide some dots for part of the loop, so phones scan once the code is complete. Test it once with your phone before sharing.' },
      { q: 'Is the animated QR code generator free?', a: 'Yes. All 70 effects and GIF, MP4 and SVG downloads are free, with no sign-up and no watermark.' },
      { q: 'Can I print an animated QR code?', a: 'Print is static, so download a PNG or SVG for print. Use the GIF or MP4 on screens, social media and websites.' },
      { q: 'Which format should I use for Instagram or TikTok?', a: 'Use MP4. Social apps accept video uploads, and MP4 keeps colours and edges sharper than GIF.' },
    ],
  },

  logo: {
    title: 'How to Make a QR Code With Your Logo',
    intro: [
      'Adding your logo to the centre of a QR code makes it instantly recognisable and builds trust — people are more likely to scan a code that clearly belongs to your brand.',
      'QR codes have built-in error correction, so part of the pattern can be covered by a logo and the code still scans. QR Generato always uses the highest error-correction level (H), which can recover up to 30% of the code.',
    ],
    steps: [
      { title: 'Add your link or content', text: 'Paste your website URL or choose another QR type such as WiFi, vCard or a payment link.' },
      { title: 'Upload your logo', text: 'Open the Logos tab, upload a PNG, JPG or SVG, or pick a ready-made Instagram, WhatsApp, YouTube, Facebook, X or UPI logo.' },
      { title: 'Match your brand colours', text: 'Set the dot colour, gradient, eye shape and frame to match your brand, then download a PNG or SVG.' },
    ],
    uses: ['Product packaging and labels', 'Business cards and flyers', 'Restaurant menus and table tents', 'Posters, banners and trade-show booths'],
    tips: [
      'A square logo with a transparent or white background looks cleanest in the centre.',
      'Keep the logo small — around 20–25% of the QR width scans most reliably.',
      'Use a dark QR colour on a light background; inverted codes are harder for some phones.',
      'Always scan the final download with two different phones before printing.',
    ],
    faqs: [
      { q: 'Will adding a logo stop the QR code from working?', a: 'No, as long as the logo is not too large. High error correction lets the code recover the area under the logo. Test the download with your phone after resizing the logo.' },
      { q: 'Can I add a logo to a QR code for free?', a: 'Yes. Uploading your own logo and downloading high-resolution PNG or SVG files is free, with no watermark.' },
      { q: 'What logo file format works best?', a: 'A PNG with a transparent background or an SVG gives the sharpest result. JPG works too.' },
    ],
  },

  businessCard: {
    title: 'Create a Business Card With a QR Code',
    intro: [
      'A QR code on your business card lets people save your contact, visit your website or connect on LinkedIn in one scan — no typing your details into their phone.',
      'QR Generato includes printable business card layouts with your QR code built in. Add your name, title and contact details, then download a print-ready 3000px PNG.',
    ],
    steps: [
      { title: 'Choose what the QR opens', text: 'Use vCard to save your contact directly, or switch to URL for your website, portfolio or LinkedIn profile.' },
      { title: 'Pick a card layout', text: 'Open the Cards tab and choose a business, ID, ticket or invitation design. Type your name and details into the card fields.' },
      { title: 'Download and print', text: 'Download the card as a high-resolution PNG and send it to your printer or print shop.' },
    ],
    uses: ['Business and networking cards', 'Conference and staff ID badges', 'Freelancer and creator cards', 'Real estate and sales cards'],
    tips: [
      'Keep the QR code at least 2 × 2 cm on the printed card.',
      'A vCard with just name, phone and email scans faster than one with every field filled.',
      'Add a short call to action near the code, such as “Scan to save my contact”.',
    ],
    faqs: [
      { q: 'What should my business card QR code link to?', a: 'A vCard saves your details straight into contacts. A URL is better if you want to send people to a website, portfolio or LinkedIn page you can update later.' },
      { q: 'Are the business card templates free?', a: 'Yes. All card layouts and high-resolution downloads are free with no watermark.' },
      { q: 'Will the QR code on my card expire?', a: 'No. The codes are static, so they work for as long as the card exists.' },
    ],
  },

  googleReview: {
    title: 'Make a Google Review QR Code',
    intro: [
      'A Google review QR code takes customers straight to your “Write a review” box, so leaving a review takes seconds instead of searching for your business on Maps.',
      'More reviews improve your local ranking on Google Maps and Search — and a printed code at the counter is one of the easiest ways to get them.',
    ],
    steps: [
      { title: 'Get your review link', text: 'In Google Business Profile, choose “Ask for reviews” (or “Get more reviews”) and copy the short link.' },
      { title: 'Paste it here', text: 'Paste the link into the Google Review field and add the “5-Star Review” frame, which reads “Rate us on Google”.' },
      { title: 'Print and display', text: 'Download a PNG and place it on the counter, receipts, table tents, packaging or thank-you cards.' },
    ],
    uses: ['Restaurants and cafés', 'Salons, clinics and gyms', 'Hotels and guesthouses', 'Shops and local services'],
    tips: [
      'Ask for the review at the moment the customer is happiest — right after payment or delivery.',
      'Google does not allow offering rewards in exchange for reviews, so keep the request simple.',
      'Put the code where people wait: the till, the table or the waiting room.',
    ],
    faqs: [
      { q: 'Where do I find my Google review link?', a: 'Open your Google Business Profile (search your business name on Google while signed in), click “Ask for reviews” and copy the link shown.' },
      { q: 'Does the QR code open the review form directly?', a: 'Yes. The Google review link opens your business with the star-rating and review box ready.' },
      { q: 'Is this free?', a: 'Yes. Creating and downloading the Google review QR code is free and it never expires.' },
    ],
  },

  instagram: {
    title: 'Create an Instagram QR Code',
    intro: [
      'An Instagram QR code opens your profile in the Instagram app the moment someone scans it, making it easy to turn real-world visitors into followers.',
      'You can style it with your own colours, templates and the Instagram logo, and download it in high resolution for print.',
    ],
    steps: [
      { title: 'Paste your profile link', text: 'Enter your profile URL, such as instagram.com/yourname. A link to a post or reel works too.' },
      { title: 'Style it', text: 'Pick a template or add the Instagram logo from the Logos tab, then add a frame and change its text to something like “Follow us”.' },
      { title: 'Share it', text: 'Download a PNG for print or an animated MP4 to post in your stories.' },
    ],
    uses: ['Shop windows and counters', 'Product packaging', 'Event banners and flyers', 'Creator and influencer business cards'],
    tips: [
      'Double-check the username spelling — a typo sends people to the wrong account.',
      'Add a reason to follow near the code, such as “New drops every Friday”.',
    ],
    faqs: [
      { q: 'Does the QR code open the Instagram app?', a: 'Yes. On phones with Instagram installed the link opens your profile in the app; otherwise it opens in the browser.' },
      { q: 'Can I link to a specific post or reel?', a: 'Yes. Paste the post or reel link instead of your profile link.' },
    ],
  },

  youtube: {
    title: 'Create a YouTube QR Code',
    intro: [
      'A YouTube QR code sends people straight to your channel, a video or a playlist — perfect for tutorials on packaging, trailers on posters or your channel on merch.',
      'Style the code with YouTube colours and logo, add a frame with your own text such as “Watch now”, and download it free in high resolution.',
    ],
    steps: [
      { title: 'Copy your YouTube link', text: 'Copy the link to your channel (youtube.com/@yourname), a video or a playlist.' },
      { title: 'Paste and style', text: 'Paste it here, then pick a template or add the YouTube logo from the Logos tab.' },
      { title: 'Download', text: 'Download a PNG or SVG for print, or a GIF/MP4 version for screens.' },
    ],
    uses: ['Product manuals and how-to guides', 'Posters and event flyers', 'Merch and packaging', 'Classroom and training handouts'],
    tips: [
      'To start a video at a specific moment, add ?t=90 (seconds) to the video link before creating the code.',
      'Channel links are better than video links if you want the code to stay useful as you upload more.',
    ],
    faqs: [
      { q: 'Does it open the YouTube app?', a: 'Yes. On phones with YouTube installed, the link opens in the app automatically.' },
      { q: 'Can I link to a playlist?', a: 'Yes. Any public YouTube link works — channel, video, short or playlist.' },
    ],
  },

  dynamic: {
    title: 'How Dynamic QR Codes Work',
    intro: [
      'A dynamic QR code holds a short link (like q.qrgenerato.com/Ab3xY7k) instead of your final address. When someone scans it, the short link sends them on to wherever you choose, so you can change the destination at any time, even after the code is printed on menus, flyers or packaging.',
      'Most QR sites charge a monthly fee for dynamic codes and switch them off when you stop paying. QR Generato makes them free with no sign-up. You also see how many people scanned each code, from which countries and on which devices.',
    ],
    sections: [
      {
        heading: 'Free dynamic QR code vs. paid QR code generators',
        paragraphs: [
          'Many QR code websites let you create a “free” dynamic code, then stop it working after a 7- or 14-day trial unless you start a subscription. Every menu, flyer and sign you printed with that code suddenly opens an error page or an advert. Here there is no trial and no plan to upgrade to: dynamic QR codes are free, and they keep working as long as people scan them.',
          'You also do not need to create an account. Your codes are listed on the My QR Codes page in the browser that made them, and each one has a private edit link, so you can manage a code from your phone, tablet or another computer.',
        ],
      },
      {
        heading: 'What you can change after printing',
        paragraphs: [
          'The printed pattern never changes, but everything behind it can. Point the code at a new website, a new menu, a seasonal offer or a different landing page; rename it so you can tell your codes apart; pause it when a campaign ends and switch it back on later; or delete it for good. Every change takes effect on the next scan.',
          'For PDF, audio and image QR codes you can also replace the uploaded file itself. That makes a dynamic code the safest choice for anything printed in large numbers, where reprinting would be expensive.',
        ],
      },
      {
        heading: 'Scan tracking without tracking people',
        paragraphs: [
          'Each dynamic code shows its total scans, a chart of the last 7 days, the top countries and whether people used an iPhone, Android phone or computer. That is enough to see which poster, table card or shop window works best.',
          'No names, IP addresses or cookies are stored for scanners. The person scanning is sent straight to your link, without an advert or a waiting page in between.',
        ],
      },
    ],
    steps: [
      { title: 'Paste your link', text: 'Choose URL / Web, paste the address you want people to reach, and make sure the Dynamic QR switch is on.' },
      { title: 'Create and style', text: 'Click “Create dynamic link”, then style the code with colours, a logo or a frame like any other QR.' },
      { title: 'Print, then edit anytime', text: 'Download and print it. To change where it goes later, type a new address under “Your dynamic QR codes” and save. The printed code updates instantly.' },
    ],
    uses: [
      'Restaurant menus and price lists that change often',
      'Printed flyers, posters and business cards you can’t reprint',
      'Product packaging that links to manuals or offers',
      'Event signs that point to the current schedule',
      'Measuring which poster or location gets the most scans',
    ],
    tips: [
      'Save the edit link somewhere safe (email it to yourself). It is the only way to edit the code from another device or after clearing your browser.',
      'Give each code a name so you can tell your menus, posters and flyers apart.',
      'Use “Pause” to stop a code temporarily, for example when an offer ends, without deleting it.',
      'Dynamic codes are shorter than codes that hold a long URL, so they stay easy to scan even at small print sizes.',
    ],
    faqs: [
      { q: 'What is a dynamic QR code?', a: 'A QR code that holds a short redirect link instead of your final address. You can change where it points at any time and see scan statistics, without reprinting the code.' },
      { q: 'Are dynamic QR codes really free here?', a: 'Yes. There is no sign-up, no subscription and no watermark. Each visitor can create up to 40 dynamic codes per day to prevent abuse.' },
      { q: 'Can I change the link after printing?', a: 'Yes. Enter the new destination under “Your dynamic QR codes” and save. Everyone who scans the printed code is sent to the new address straight away.' },
      { q: 'What scan statistics do I get?', a: 'Total scans, a chart of the last 7 days, the top countries and the device types (iPhone, Android, desktop). No personal data or IP addresses are stored.' },
      { q: 'Do I need an account?', a: 'No. Your codes are saved in your browser together with a secret edit key. Use “Copy edit link” to open a code on another device.' },
      { q: 'How do I delete a dynamic QR code?', a: 'Open My QR Codes from the menu and click Delete on the code. It stops working straight away, and anyone who scans it sees “not found”.' },
      { q: 'What happens if I clear my browser data?', a: 'The QR code keeps working, but you can no longer edit it unless you saved its edit link. Keep the edit link somewhere safe.' },
      { q: 'Static or dynamic: which should I use?', a: 'Use dynamic when the destination might change or you want scan counts. Use static for Wi-Fi, contact cards and payment codes, which work offline and never depend on a server.' },
      { q: 'Do dynamic QR codes stop working after a trial?', a: 'Not here. There is no trial or subscription, so your dynamic QR code keeps working. You can delete yours whenever you like.' },
      { q: 'Does the person scanning see an advert first?', a: 'No. Scanning goes straight to your destination with a fast redirect, without adverts or a waiting page.' },
    ],
  },

  scanner: {
    title: 'How to Scan a QR Code Online',
    intro: [
      'This free online QR code scanner reads codes with your phone, tablet or laptop camera, or from a picture you already have, such as a screenshot or a photo of a poster.',
      'Scanning happens entirely in your browser. The image is never uploaded, so it is safe for Wi-Fi passwords, payment codes and private links. You see exactly what the code contains before you open anything.',
    ],
    sections: [
      {
        heading: 'Scan a QR code from a screenshot or image',
        paragraphs: [
          'Phone cameras can only scan codes in front of them, which is a problem when the QR code is on your own screen: in a screenshot, a WhatsApp message, an email, a PDF ticket or a social media post. Upload the picture here and the scanner finds the code inside it and shows what it contains. It works with PNG, JPG, WebP and other common image formats.',
          'On a computer you can do the same with a screenshot of a web page or a document, without picking up your phone.',
        ],
      },
      {
        heading: 'Check a QR code before you open it',
        paragraphs: [
          'Fake QR codes stuck over real ones on parking meters, restaurant tables and posters are a common scam. They send people to look-alike payment or login pages. This scanner shows the full decoded link or text first and opens nothing automatically, so you can see where a code really leads and decide whether to trust it.',
          'Be careful with codes that ask you to log in, pay or install an app, especially when the address does not match the business you expect.',
        ],
      },
      {
        heading: 'Scan with a laptop, PC, iPhone or Android',
        paragraphs: [
          'The scanner runs in any modern browser: Chrome, Safari, Edge and Firefox on Windows, Mac, iPhone, iPad and Android. Allow camera access once and hold the code in front of your webcam or phone camera. There is no app to install and no account to create, and the camera picture is processed on your device only.',
          'Found a code you want to reuse? Copy its content and make your own QR code with a logo, colours and a frame in the generator above.',
        ],
      },
    ],
    steps: [
      { title: 'Choose camera or image', text: 'Allow camera access to scan live, or upload a screenshot or photo that contains a QR code.' },
      { title: 'Point at the code', text: 'Hold the code steady inside the frame. It is read automatically in a moment.' },
      { title: 'Check, then open', text: 'Read the decoded link or text first, then open, copy or reuse it to make your own styled QR code.' },
    ],
    uses: [
      'Reading a QR code in a screenshot or image on your phone',
      'Scanning on a laptop or PC with a webcam',
      'Checking where a QR code leads before opening it',
      'Testing your own printed QR codes before a print run',
      'Copying the text or Wi-Fi details stored in a code',
    ],
    tips: [
      'If a code won’t read, move closer, add light and avoid glare on glossy paper.',
      'For screenshots, crop around the code so it fills most of the image.',
      'Be careful with codes on stickers in public places: check the decoded address before opening it.',
    ],
    faqs: [
      { q: 'Can I scan a QR code from a screenshot or picture?', a: 'Yes. Upload the image and the scanner finds and reads the QR code in it. This is handy when the code is on your own screen.' },
      { q: 'Does the scanner work on a laptop or PC?', a: 'Yes. It works in any modern browser with a webcam, and image upload works on any device.' },
      { q: 'Is my camera image uploaded?', a: 'No. Decoding happens on your device in the browser. Nothing from the camera or your images is sent to a server.' },
      { q: 'Is it free?', a: 'Yes. There is no app to install, no sign-up and no limit on scans.' },
      { q: 'Why won’t my QR code scan?', a: 'Common causes are low light, glare, blur, or a code that is too small or has too little contrast. Try more light, hold steadier, or upload a sharper image.' },
      { q: 'How do I scan a QR code on my laptop?', a: 'Open this page, allow camera access and hold the QR code in front of your webcam. If the code is on your screen, take a screenshot and upload it instead.' },
      { q: 'How can I tell if a QR code is safe?', a: 'Scan it here first: the decoded address is shown without opening it. Check that the website name matches the business, and avoid codes that ask for passwords or payment on an unfamiliar site.' },
    ],
  },

  bulk: {
    title: 'How to Generate QR Codes in Bulk',
    intro: [
      'Make up to 200 QR codes at once: paste one link, UPI ID, Wi-Fi string or serial number per line, and download every code as a high-resolution PNG and SVG in a single ZIP file.',
      'The ZIP includes an index.csv that matches each file to its content, which makes it easy to use with label printers, mail merge or product databases. Everything is generated in your browser, so your list is never uploaded.',
    ],
    steps: [
      { title: 'Paste your list', text: 'Copy a column from Excel or Google Sheets and paste it, one item per line.' },
      { title: 'Check the previews', text: 'Preview the codes. Tap any preview to style that code individually in the full studio.' },
      { title: 'Download the ZIP', text: 'Click “Download ZIP” to get every code as PNG and SVG with an index.csv, or print them all on one sheet.' },
    ],
    uses: [
      'Product labels, SKUs and serial numbers',
      'Event tickets, badges and table numbers',
      'Asset and inventory tags',
      'Unique links for each store, flyer or salesperson',
      'Classroom handouts with a different link per student',
    ],
    tips: [
      'Keep each line short. Long text makes dense codes that are harder to scan at small sizes.',
      'Use the SVG files for professional printing: they stay sharp at any size.',
      'Number your items in the sheet first. Files are named in the same order (001, 002 …), so they are easy to match.',
    ],
    faqs: [
      { q: 'How many QR codes can I make at once?', a: 'Up to 200 per batch. For more, split your list and run several batches.' },
      { q: 'What do I get in the download?', a: 'A ZIP with a PNG (1024 × 1024) and an SVG for every line, plus an index.csv listing each code’s number, content and file names.' },
      { q: 'Can I import from Excel or Google Sheets?', a: 'Yes. Select the column, copy it and paste it into the box: each cell becomes one line and one QR code.' },
      { q: 'Is my list uploaded anywhere?', a: 'No. The codes are generated in your browser, so your data never leaves your device.' },
      { q: 'Is bulk QR generation free?', a: 'Yes, with no sign-up and no watermark on any of the codes.' },
    ],
  },

  audio: {
    title: 'How to Make an MP3 or Audio QR Code',
    intro: [
      'An audio QR code plays a song, voice message, podcast clip or audio guide when someone scans it. It opens a simple page with a play button that works on iPhone and Android, with no app needed.',
      'Upload an MP3 or M4A file (iPhone voice memos work too) of up to 15 MB, free. Replace the audio later without changing the printed code, and see how many people listened.',
    ],
    sections: [
      {
        heading: 'What happens when someone scans an audio QR code',
        paragraphs: [
          'The phone opens a simple page with the title of your recording, a play button and a download button. The audio plays in the phone’s own browser on iPhone and Android, so there is no app to install and no account to create. It is the easiest way to add sound to something printed.',
          'Upload the file itself instead of relying on a streaming link, and it plays without a Spotify or YouTube account and without adverts in front of your message.',
        ],
      },
      {
        heading: 'Ideas for audio and voice message QR codes',
        paragraphs: [
          'Record a voice message for a birthday or wedding card, add a song to a gift, or put a personal greeting on a photo print. Musicians use audio QR codes on posters, CD covers and merchandise; museums, galleries and tour guides use them for audio guides on signs; teachers put pronunciation clips on worksheets; and shops add spoken instructions to product packaging.',
        ],
      },
      {
        heading: 'Recording tips for clear playback',
        paragraphs: [
          'Record in a quiet room with the phone close to your mouth, and trim silence at the start and end. A 1–3 minute voice message saved as MP3 or M4A is usually well under 5 MB, which starts quickly on mobile data. If you change your mind later, record a new version and use “Replace file”: the printed code plays the new audio.',
        ],
      },
    ],
    steps: [
      { title: 'Upload your audio', text: 'Choose Audio / MP3 and click “Upload an audio file instead of a link”. You can also paste a Spotify, SoundCloud or YouTube link.' },
      { title: 'Style the code', text: 'Add colours, a frame like “Scan to listen”, or a greeting card design.' },
      { title: 'Print or share', text: 'Download a PNG or SVG for cards, posters, gifts or packaging.' },
    ],
    uses: ['Wedding and birthday cards with a song or message', 'Museum, tour and exhibition audio guides', 'Podcast and music promotion on posters', 'Voice instructions on products', 'Language-learning worksheets'],
    tips: [
      'Short clips load fastest on mobile data. Export voice messages as MP3 at 128 kbps or lower.',
      'Add “Scan to listen” near the code so people know to turn their sound on.',
      'For a long playlist, paste a Spotify or YouTube link instead of uploading.',
    ],
    faqs: [
      { q: 'Which audio files can I upload?', a: 'MP3 and M4A (including iPhone voice memos), up to 15 MB.' },
      { q: 'Does it work on iPhone and Android?', a: 'Yes. Scanning opens a page with a standard audio player that works in every phone browser, plus a download button.' },
      { q: 'Can I change the audio later?', a: 'Yes. Use “Replace file” on the My QR Codes page; the printed QR keeps working with the new audio.' },
      { q: 'Is it free?', a: 'Yes, with no sign-up. Files nobody plays for 6 months are deleted automatically.' },
      { q: 'Can I turn a voice message into a QR code?', a: 'Yes. Record it with your phone’s voice recorder (iPhone voice memos are M4A), upload it as an audio file, and print the QR code on a card or gift.' },
      { q: 'Can I use a Spotify or YouTube link instead?', a: 'Yes. Paste the link into the Audio / MP3 type and the QR code opens it. Uploading a file works without any app or account for the listener.' },
    ],
  },

  image: {
    title: 'How to Turn an Image Into a QR Code',
    intro: [
      'An image QR code shows a photo when someone scans it: a product picture, flyer, poster, certificate, menu photo or a memory to share. It opens a clean page with the image and a download button.',
      'Upload a JPG, PNG or WebP of up to 8 MB, free and without an account. Swap the picture later without reprinting, and see how many people viewed it.',
    ],
    sections: [
      {
        heading: 'What people see when they scan an image QR code',
        paragraphs: [
          'Scanning opens a clean page with your picture shown full width, its title and a download button. It works in any phone browser on iPhone and Android, with no app and no sign-in. People can zoom in on details, save the image or share it.',
          'Uploading the photo directly means you do not need a website, an image host or a social media account, and the person scanning does not have to log in to see it.',
        ],
      },
      {
        heading: 'Ways to use a photo QR code',
        paragraphs: [
          'Shops put image QR codes on shelf labels to show a product in use or a size chart. Event organisers link a printed flyer to the full-size poster. Photographers and families add a QR code to a gift, frame or card that opens a favourite photo. Estate agents and car sellers link a printed sign to a picture of the floor plan or the vehicle. You can also use it to share a certificate, a timetable photo or a map.',
        ],
      },
      {
        heading: 'Getting the best image quality',
        paragraphs: [
          'Use JPG for photos and PNG for screenshots, logos and graphics with text. Images around 1500–2500 pixels wide look sharp on every phone while staying small enough to open quickly. If you need to update the picture later, for example a new price or a corrected poster, use “Replace file” and the printed QR shows the new image.',
        ],
      },
    ],
    steps: [
      { title: 'Upload your image', text: 'Choose Image / Photo and click “Upload an image instead of a link”, or paste a link to an image that’s already online.' },
      { title: 'Style the code', text: 'Pick colours, a frame or a card design that matches your photo or brand.' },
      { title: 'Print or share', text: 'Download a PNG or SVG for prints, packaging, cards or displays.' },
    ],
    uses: ['Product photos on packaging and shelves', 'Event posters and flyers', 'Photo memories on gifts and cards', 'Certificates and ID photos', 'Real-estate and car-sale listings'],
    tips: [
      'Photos from a phone are often 3–5 MB. They work, but smaller images open faster on mobile data.',
      'Name the image (it appears on the scan page) so people know what they’re looking at.',
      'To show several photos, put them into one PDF and use a PDF QR code.',
    ],
    faqs: [
      { q: 'Which image types can I upload?', a: 'JPG, PNG and WebP images up to 8 MB.' },
      { q: 'Can I replace the photo after printing?', a: 'Yes. Use “Replace file” on the My QR Codes page; the same QR shows the new image straight away.' },
      { q: 'Can people download the image?', a: 'Yes. The scan page shows the image with a download button.' },
      { q: 'Is my image public?', a: 'Anyone with the QR code or link can open it, so don’t upload private documents. It isn’t listed or shown in search engines.' },
      { q: 'Can I make a QR code for a photo for free?', a: 'Yes. Upload a JPG, PNG or WebP photo of up to 8 MB. Creating and scanning the code is free, with no account and no watermark.' },
      { q: 'Can one QR code show several photos?', a: 'Put the photos into a single PDF and use the PDF QR code, or upload them to an album and use a link QR code.' },
    ],
  },
};
