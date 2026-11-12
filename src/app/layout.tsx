export const metadata = {
  title: "Snapjoy — Capture the moment, share the joy",
  description:
    "Platform photo booth berbasis web untuk acara Anda. Tamu memindai QR, mengambil foto dengan frame dan filter, lalu mengunggah ke galeri bersama secara realtime.",
  openGraph: {
    title: "Snapjoy — Capture the moment, share the joy",
    description:
      "Platform photo booth berbasis web untuk acara Anda. Tanpa instalasi aplikasi, tanpa akun tamu.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Snapjoy" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180x180.png" />
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#0f172a" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
