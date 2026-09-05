import "./globals.css";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  metadataBase: new URL("https://tathva.org"), // ✅ set your production domain here
  title: "Tathva ’25 | National Techno-Management Fest",
  description:
    "Official website of Tathva ’25, the annual techno-management festival of NIT Calicut. Explore events, workshops, and exhibitions.",
  keywords: [
    "Tathva 25",
    "NIT Calicut",
    "Techno-Management Fest",
    "College Fest",
    "Workshops",
    "Events",
  ],
  authors: [{ name: "Tathva Team" }],
  openGraph: {
    title: "Tathva ’25 | National Techno-Management Fest",
    description:
      "Join us at Tathva ’25, NIT Calicut’s annual techno-management fest. Explore events, competitions, workshops, and exhibitions.",
    url: "https://tathva.org",
    siteName: "Tathva 25",
    images: [
      {
        url: "/tathva25.svg", // will resolve to https://tathva.org/tathva25.svg
        width: 1200,
        height: 630,
        alt: "Tathva 25 Banner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tathva ’25 | National Techno-Management Fest",
    description:
      "The official website of Tathva ’25, NIT Calicut’s annual techno-management festival.",
    images: ["/tathva25.svg"],
    creator: "@tathva",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ overflowX: "clip" }}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
