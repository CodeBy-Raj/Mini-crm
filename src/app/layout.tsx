import type { Metadata } from "next";
import "./globals.css";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export const metadata: Metadata = {
  title: "AI CRM Audience & Campaign Manager",
  description: "An intelligent CRM audience segmenter and dynamic marketing campaign builder powered by Gemini models and PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col lg:flex-row overflow-x-hidden selection:bg-indigo-600/30">
        <SidebarNav />
        
        {/* Main Content Pane */}
        <main className="flex-1 lg:pl-64 xl:pl-72 min-h-screen relative flex flex-col">
          {/* Subtle background glow effect anchors */}
          <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-indigo-950/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-blue-950/15 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full max-w-6xl mx-auto z-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

