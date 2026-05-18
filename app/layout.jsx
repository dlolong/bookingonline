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
      <head>
        <meta name="color-sheme" content="light"/>
      </head>
      <body className='bg-white text-black'>
        <AppProvider>
          <Navbar />
          <Toast />
          <div className="pt-16">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  )
}