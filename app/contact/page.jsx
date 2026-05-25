import { Suspense } from 'react'
import ContactForm from './ContactForm'

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ContactForm />
    </Suspense>
  )
}