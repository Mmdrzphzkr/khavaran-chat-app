// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
export const metadata = {
  title: "NextChat",
  description: "Real-time chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
