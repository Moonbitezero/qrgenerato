// app/page.tsx
import QRStudio from '@/components/qr-studio';
import {
  QrCode,
  ShieldCheck,
  Zap,
  Sparkles,
  IndianRupee,
  CheckCircle2,
  Layers,
  Lock,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

const SEO_FAQS = [
  {
    question: 'Is there a free QR code generator?',
    answerHtml:
      '<p>Yes, <strong>QR GENERATO</strong> is a 100% free QR code generator with no sign up, no watermarks, and no expiration. Because all QR matrices are generated directly inside your browser, your static QR codes are free forever and never expire.</p>',
    answerText:
      'Yes, QR GENERATO is a 100% free QR code generator with no sign up, no watermarks, and no expiration. Because all QR matrices are generated directly inside your browser, your static QR codes are free forever and never expire.',
  },
  {
    question: 'What is the best QR code generator?',
    answerHtml:
      '<p><strong>QR GENERATO</strong> is rated as the best QR code generator because it combines 12+ payload types (including UPI payments, Website URLs, Wi-Fi, and vCards) with custom finder eye shapes, multi-stop gradients, image-filled pixel masking, and real-time optical scan verification.</p>',
    answerText:
      'QR GENERATO is rated as the best QR code generator because it combines 12+ payload types (including UPI payments, Website URLs, Wi-Fi, and vCards) with custom finder eye shapes, multi-stop gradients, image-filled pixel masking, and real-time optical scan verification.',
  },
  {
    question: 'What is the best free QR code generator?',
    answerHtml:
      '<p>The best free QR code generator is one that does not lock high-resolution vector downloads behind a paywall or deactivate your links after a trial period. QR GENERATO gives you unlimited high-res PNG, Vector SVG, A4 sticker sheets, and batch CSV exports completely free without requiring an account.</p>',
    answerText:
      'The best free QR code generator is one that does not lock high-resolution vector downloads behind a paywall or deactivate your links after a trial period. QR GENERATO gives you unlimited high-res PNG, Vector SVG, A4 sticker sheets, and batch CSV exports completely free without requiring an account.',
  },
  {
    question: 'Does Google have a QR code generator?',
    answerHtml:
      '<p>Yes, Google Chrome includes a basic built-in QR generator in the address bar share menu for web links. However, it only creates basic black-and-white URL codes. If you need custom colors, brand logos, UPI payment QR codes, Wi-Fi sharing, or vector SVG downloads, QR GENERATO is the best free alternative.</p>',
    answerText:
      'Yes, Google Chrome includes a basic built-in QR generator in the address bar share menu for web links. However, it only creates basic black-and-white URL codes. If you need custom colors, brand logos, UPI payment QR codes, Wi-Fi sharing, or vector SVG downloads, QR GENERATO is the best free alternative.',
  },
  {
    question: 'What is the best online QR code generator?',
    answerHtml:
      '<p><strong>QR GENERATO</strong> is the best online QR code generator for privacy and creative control. It runs 100% client-side in your browser—meaning your sensitive Wi-Fi passwords, phone numbers, and UPI IDs are never uploaded to an external server—while offering studio-grade visual customization.</p>',
    answerText:
      'QR GENERATO is the best online QR code generator for privacy and creative control. It runs 100% client-side in your browser—meaning your sensitive Wi-Fi passwords, phone numbers, and UPI IDs are never uploaded to an external server—while offering studio-grade visual customization.',
  },
  {
    question: 'What is a dynamic QR code generator?',
    answerHtml:
      '<p>A dynamic QR code generator encodes a short redirect URL into the QR code so you can change the destination link later or track scan analytics. However, dynamic QR codes require paid monthly subscriptions and stop working if you cancel. QR GENERATO creates direct-encoded static QR codes that are 100% free and work forever with zero expiration.</p>',
    answerText:
      'A dynamic QR code generator encodes a short redirect URL into the QR code so you can change the destination link later or track scan analytics. However, dynamic QR codes require paid monthly subscriptions and stop working if you cancel. QR GENERATO creates direct-encoded static QR codes that are 100% free and work forever with zero expiration.',
  },
  {
    question: 'How to use a QR code generator?',
    answerHtml:
      '<p>Using our QR code generator takes three simple steps: (1) Select your payload type (Website URL, UPI Pay, Wi-Fi, Email, Phone, or Contact Card) and enter your details. (2) Customize your gradient colors, corner eye shapes, CTA frame, or upload a logo/artwork. (3) Check the Live Scannable Verified badge and click <strong>Download PNG</strong> or <strong>Export Vector SVG</strong>.</p>',
    answerText:
      'Using our QR code generator takes three simple steps: (1) Select your payload type (Website URL, UPI Pay, Wi-Fi, Email, Phone, or Contact Card) and enter your details. (2) Customize your gradient colors, corner eye shapes, CTA frame, or upload a logo/artwork. (3) Check the Live Scannable Verified badge and click Download PNG or Export Vector SVG.',
  },
  {
    question: 'QR code generator kaise kare? (QR कोड कैसे बनाएं?)',
    answerHtml:
      '<p><strong>QR GENERATO</strong> पर फ्री QR कोड बनाना बहुत आसान है: 1. सबसे पहले ऊपर दिए गए विकल्पों में से अपना प्रकार चुनें (जैसे <strong>UPI Pay</strong>, <strong>Website</strong>, <strong>Wi-Fi</strong>, या <strong>Phone</strong>) और अपनी जानकारी भरें। 2. अपनी पसंद का कलर ग्रेडिएंट, बॉर्डर फ्रेम, या बीच में लगाने के लिए अपना फोटो/लोगो (Logo) चुनें। 3. अब <strong>Download PNG</strong> या <strong>SVG</strong> बटन पर क्लिक करके अपना हाई-क्वालिटी QR कोड तुरंत मुफ्त में डाउनलोड करें।</p>',
    answerText:
      'QR GENERATO पर फ्री QR कोड बनाना बहुत आसान है: 1. सबसे पहले ऊपर दिए गए विकल्पों में से अपना प्रकार चुनें (जैसे UPI Pay, Website, Wi-Fi, या Phone) और अपनी जानकारी भरें। 2. अपनी पसंद का कलर ग्रेडिएंट, बॉर्डर फ्रेम, या बीच में लगाने के लिए अपना फोटो/लोगो (Logo) चुनें। 3. अब Download PNG या SVG बटन पर क्लिक करके अपना हाई-क्वालिटी QR कोड तुरंत मुफ्त में डाउनलोड करें।',
  },
];

export default function Home() {
  // Exact FAQPage JSON-LD schema format requested
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SEO_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answerHtml,
      },
    })),
  };

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'QR GENERATO — Free QR Code Generator Online',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'The best free QR code generator online with no sign up and no expiration. Create custom QR codes with logo, UPI QR codes, email QR codes, and image-filled artwork in PNG and SVG.',
  };

  return (
    <main className="min-h-screen bg-[#07070b] text-zinc-100 relative overflow-x-hidden pb-28 lg:pb-20">
      {/* FAQPage JSON-LD Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* WebApplication JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      {/* Vibrant Multi-Color Ambient Mesh Glows */}
      <div className="pointer-events-none fixed top-[-180px] left-[8%] w-[320px] sm:w-[550px] h-[320px] sm:h-[550px] rounded-full bg-violet-600/20 blur-[130px] sm:blur-[150px]" />
      <div className="pointer-events-none fixed top-[20%] right-[-120px] w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full bg-fuchsia-600/15 blur-[130px] sm:blur-[150px]" />
      <div className="pointer-events-none fixed bottom-[-180px] left-[35%] w-[320px] sm:w-[520px] h-[320px] sm:h-[520px] rounded-full bg-cyan-500/10 blur-[130px] sm:blur-[150px]" />

      {/* Main Interactive Application */}
      <QRStudio />

      {/* =====================================================================
          ON-PAGE SEO CONTENT & FAQ SECTION (650+ Words + 8 Schema FAQs)
         ===================================================================== */}
      <section
        aria-label="About QR GENERATO Free Online QR Code Generator"
        className="max-w-[1400px] mx-auto px-4 sm:px-8 mt-12 sm:mt-20 space-y-10"
      >
        {/* Card 1: 600+ Word SEO Guide */}
        <article className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />

          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-bold text-violet-300">
              <Sparkles size={13} /> Comprehensive Guide &amp; Features
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              The Best Free QR Code Generator Online — No Sign Up &amp; No Expiration
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Welcome to <strong>QR GENERATO</strong>, the most advanced{' '}
              <strong>qr code generator</strong> built for creators, businesses, developers, and
              everyday users. When searching for a reliable <strong>free qr code generator</strong>,
              most platforms lock high-resolution downloads behind expensive subscriptions or replace
              your destination URLs with temporary redirect links that break after a 14-day trial.
              Our platform is engineered differently: it is a 100%{' '}
              <strong>free qr code generator no sign up</strong> and{' '}
              <strong>free qr code generator no expiration</strong> tool that processes everything
              directly inside your web browser.
            </p>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Whether you need a fast <strong>link to qr code generator</strong> for a marketing
              campaign, an <strong>email qr code generator online</strong> for customer support, or
              a specialized <strong>upi qr code generator</strong> for instant digital payments in
              India, QR GENERATO encodes your data directly into the mathematical QR matrix.
              Because there are no middleman tracking servers, every code you create is a permanent{' '}
              <strong>qr code generator free no expiration</strong> asset that works forever.
            </p>
          </div>

          {/* 3-Column Feature Deep Dive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/[0.08]">
            <div className="bg-[#0b0b12] border border-white/[0.07] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                <Layers size={20} />
              </div>
              <h3 className="text-base font-bold text-white">
                Custom QR Code Generator With Logo &amp; Artwork
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Stand out from boring black-and-white squares. Use our{' '}
                <strong>qr code generator with logo</strong> mode to place your brand emblem in the
                center, or activate our signature <em>Image-Filled Pixel Mask</em> engine. If you
                have ever used an <strong>adobe express qr code generator</strong> or{' '}
                <strong>qr code generator adobe</strong> style tool, you will love our custom corner
                finder eyes, multi-stop neon gradients, and call-to-action frames.
              </p>
            </div>

            <div className="bg-[#0b0b12] border border-white/[0.07] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <IndianRupee size={20} />
              </div>
              <h3 className="text-base font-bold text-white">
                Instant UPI QR Code Generator &amp; 12+ Payload Types
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Accept contactless payments effortlessly with our dedicated{' '}
                <strong>upi qr code generator</strong>. Enter your VPA/UPI ID, payee name, and exact
                INR amount to generate a scannable payment badge compatible with Google Pay, PhonePe,
                and Paytm. We also support Wi-Fi auto-connect, vCard contact cards, calendar events,
                SMS, and <strong>free qr code generator google</strong> Maps location pins.
              </p>
            </div>

            <div className="bg-[#0b0b12] border border-white/[0.07] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock size={20} />
              </div>
              <h3 className="text-base font-bold text-white">
                Optical Verification &amp; Print-Ready Exports
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Why is QR GENERATO rated as the <strong>best free qr code generator</strong>?
                Every time you customize colors or upload an image, our built-in optical decoder
                test-scans your canvas in real time to guarantee 100% readability. Download crisp
                raster PNGs, scalable vector SVGs, batch CSV archives, or A4 sticker sheets from{' '}
                <strong>the qr code generator</strong> built for professionals.
              </p>
            </div>
          </div>

          {/* Why Choose Us Checklist */}
          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            <h3 className="text-lg font-bold text-white">
              Why Choose Our QR Code Generator Free Online?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              When users search for a <strong>qr code generator google</strong> or{' '}
              <strong>qr code generator online</strong>, they need speed, privacy, and zero watermarks.
              Because QR GENERATO executes 100% client-side using HTML5 Canvas and vector path
              algorithms, your sensitive Wi-Fi passwords, vCard phone numbers, and UPI IDs never
              leave your device. You get the creative power of the{' '}
              <strong>best qr code generator</strong> combined with complete data privacy.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm text-zinc-300 pt-2">
              <li className="flex items-center gap-2.5 bg-[#0b0b12] p-3.5 rounded-xl border border-white/[0.06]">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>
                  <strong>Zero Account Required:</strong> True <strong>qr code generator free</strong>{' '}
                  workflow with instant downloads.
                </span>
              </li>
              <li className="flex items-center gap-2.5 bg-[#0b0b12] p-3.5 rounded-xl border border-white/[0.06]">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>
                  <strong>High Error Correction (Level H):</strong> Up to 30% damage resistance for
                  logos and pixel masks.
                </span>
              </li>
              <li className="flex items-center gap-2.5 bg-[#0b0b12] p-3.5 rounded-xl border border-white/[0.06]">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>
                  <strong>Commercial Print Quality:</strong> Export lossless SVG vectors alongside
                  A4 printable sticker grids.
                </span>
              </li>
            </ul>
          </div>
        </article>

        {/* Card 2: Dedicated SEO-Friendly FAQ Accordion Section */}
        <section
          aria-labelledby="faq-heading"
          className="relative overflow-hidden bg-[#12121c]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 text-xs font-bold text-fuchsia-300">
                <HelpCircle size={13} /> Frequently Asked Questions
              </div>
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Everything You Need to Know About Our Free QR Code Generator
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full self-start sm:self-auto shrink-0">
              8 Verified Answers
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {SEO_FAQS.map((faq, idx) => (
              <details
                key={idx}
                open={idx < 2}
                className="group bg-[#0b0b12] border border-white/[0.08] hover:border-violet-500/40 rounded-2xl p-5 transition-all"
              >
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-bold text-sm sm:text-base text-white">
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-extrabold flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    size={18}
                    className="text-zinc-400 shrink-0 transition-transform duration-200 group-open:rotate-180 group-open:text-fuchsia-400"
                  />
                </summary>
                <div className="mt-3.5 pt-3.5 border-t border-white/[0.06] text-xs sm:text-sm text-zinc-300 leading-relaxed pl-9">
                  {faq.answerText}
                </div>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
