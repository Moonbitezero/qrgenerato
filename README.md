# QR Generato

A client-side QR code creator built with Next.js App Router, React, TypeScript and `qrcode`.

## Features

- Real QR generation with high error correction (`H`)
- Content types: website URL, plain text, email, Wi-Fi, and phone number
- Custom foreground/background colors and quick palettes
- Image-filled QR mode: the uploaded image's colors are sampled into QR data modules while finder patterns remain solid for scanning
- Center-image/logo mode
- PNG (720 × 720) and SVG downloads
- Client-side generation and image processing; no app server upload, account or API key
- Responsive layout for desktop and mobile

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Production build

```bash
npm run build
npm start
```

## Notes on image QR mode

Image-filled QR codes balance image appearance and scan reliability. The source image is represented by the colors of the QR's dark modules, and the three finder zones are kept in the selected solid QR color. Some source images, content lengths, phone cameras and printing processes can still make a stylized QR difficult to scan. Always test the downloaded code with at least one phone before printing or publishing it. A plain-color QR is the most reliable choice for important links.

## Privacy

The image is read with the browser's `FileReader` and drawn to an in-memory canvas. It is not sent to a backend by this application. No backend, database, account, or analytics code is included.
