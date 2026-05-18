import './globals.css'
import { AppProvider } from '@/context/AppContext'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'

export const metadata = {
  title: 'Resort Booking',
  description: 'Easy resort booking system',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Resort Booking',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>
          <Navbar />
          <Toast />
          <div className="pt-24">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  )
}