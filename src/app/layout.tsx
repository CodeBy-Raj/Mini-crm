import type { Metadata } from "next";
import "./globals.css";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { CrmDataProvider } from "@/components/crm-data-provider";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const saved = localStorage.getItem('theme');
            if (saved === 'light') {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            }
          } catch (_) {}
        ` }} />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans flex flex-col lg:flex-row overflow-x-hidden selection:bg-indigo-600/30 transition-colors duration-300">
          <CrmDataProvider>
            <SidebarNav />
            
            {/* Main Content Pane */}
            <main className="flex-1 lg:pl-64 xl:pl-72 min-h-screen relative flex flex-col bg-background text-foreground transition-colors duration-300">
              {/* Subtle background glow effect anchors */}
              <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] dark:bg-indigo-950/15 bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none transition-colors duration-300" />
              <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] dark:bg-blue-950/15 bg-blue-200/20 rounded-full blur-[140px] pointer-events-none transition-colors duration-300" />
              
              {/* Elegant Global Top Header */}
              <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 flex justify-between items-center z-20">
                <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  AI CRM
                </span>
              </div>

              <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col gap-6 w-full max-w-6xl mx-auto z-10 pt-2 sm:pt-3">
                {children}
              </div>
            </main>
          </CrmDataProvider>
      </body>
    </html>
  );
}

