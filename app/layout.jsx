import './globals.css'
import { AppProvider } from '@/context/AppContext'
import Navbar from '@/components/Navbar'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>
          <Navbar />
          {children}
        </AppProvider>
      </body>
    </html>
  )
}