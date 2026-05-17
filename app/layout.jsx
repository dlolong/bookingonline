import './globals.css'
import { AppProvider } from '@/context/AppContext'
import Navbar from '@/components/Navbar'
import Toast from '@/components/Toast'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
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