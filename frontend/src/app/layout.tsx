import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'NIDHINETRA — AI-Powered Public Fund Intelligence Platform | MPLADS Monitoring',
  description:
    'NIDHINETRA: Nationwide AI-powered public fund intelligence platform for monitoring MPLADS funds, development works, financial anomalies, and project progress across India.',
  keywords: [
    'NIDHINETRA',
    'Public Fund Intelligence',
    'MPLADS',
    'MPLADS Monitoring',
    'Government of India',
    'MoSPI',
    'Member of Parliament',
    'Local Area Development Scheme',
    'Project Monitoring',
    'AI Decision Support',
    'Public Infrastructure',
    'Transparency',
  ],
  authors: [{ name: 'Ministry of Statistics & Programme Implementation (MoSPI)' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        <ToastProvider>
          <AuthProvider>
            <div id="main-content" className="flex-1 flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
