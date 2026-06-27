import './globals.css';
import { ToastProvider } from '@/components/ui';

export const metadata = {
  title: 'Agnichakra Club Portal',
  description: 'Member management portal for Agnichakra Club',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
