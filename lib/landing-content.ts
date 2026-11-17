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
  | 'bulk';

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
      { q: 'What happens if I clear my browser data?', a: 'The QR code keeps working, but you can no longer edit it unless you saved its edit link. Keep the edit link somewhere safe.' },
      { q: 'Static or dynamic: which should I use?', a: 'Use dynamic when the destination might change or you want scan counts. Use static for Wi-Fi, contact cards and payment codes, which work offline and never depend on a server.' },
    ],
  },

  scanner: {
    title: 'How to Scan a QR Code Online',
    intro: [
      'This free online QR code scanner reads codes with your phone, tablet or laptop camera, or from a picture you already have, such as a screenshot or a photo of a poster.',
      'Scanning happens entirely in your browser. The image is never uploaded, so it is safe for Wi-Fi passwords, payment codes and private links. You see exactly what the code contains before you open anything.',
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
};
