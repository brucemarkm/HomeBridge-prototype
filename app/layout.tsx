import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./globals.css";
import "./beta.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { WorkspaceProvider } from "../components/beta/workspace-provider";
export const metadata: Metadata = {
  title: "Homebridge · A smarter, simpler way home.",
  description:
    "Analyze a home, understand the numbers, prepare proposed offer terms, and try professional review in one buyer-focused workspace.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
