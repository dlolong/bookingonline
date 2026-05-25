'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { supabase } from '@/lib/supabaseClient'

function normalizeMobile(value) {
  if (value.startsWith('09')) {
    return '+63' + value.slice(1)
  }
  if (value.startsWith('639')) {
    return '+' + value
  }
  return value
}

function isValidMobileNumber(value) {
  const cleaned = value.replace(/\s+/g, '')

  const regex = /^(09|\+639|639)\d{9}$/
  return regex.test(cleaned)
}


export default function ContactPage() {
  const router = useRouter()
  const { showToast } = useApp()
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    resort_name: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const searchParams = useSearchParams()
  const partnerSlug = searchParams.get('partner')
  const [partnerAgent, setPartnerAgent] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!isValidMobileNumber(form.mobile)) {
      showToast({
        type: 'error',
        message:
          'Please enter a valid mobile number (e.g. 09171234567 or +639171234567)',
      })
      setLoading(false)
      return
    }


    const { error } = await supabase.from('leads').insert([
      {
        name: form.name,
        email: form.email,
        mobile: normalizeMobile(form.mobile),
        resort_name: form.resort_name,
        message: form.message,
        status: 'new',
        partner_agent_id: partnerAgent?.id || null,
        source: partnerAgent ? 'partner_referral' : 'contact_page',
      },
    ])

    setLoading(false)

    if (error) {
      showToast({
        type: 'error',
        message: 'Failed to send request.',
      })
      return
    }

    showToast({
      type: 'success',
      message: 'Your request has been sent. We will contact you shortly.',
    })
    setSuccess(true)
    // router.push('/contact/success')
  }

 useEffect(() => {
  const loadPartner = async () => {
    if (!partnerSlug) return

    const { data } = await supabase
      .from('partner_agents')
      .select('*')
      .eq('slug', partnerSlug)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    setPartnerAgent(data || null)
  }

  loadPartner()
}, [partnerSlug])

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="bg-white w-full max-w-md rounded-2xl shadow p-6 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✓
          </div>

          <h1 className="text-2xl font-bold mb-2">
            Request Sent Successfully
          </h1>

          <p className="text-gray-600 mb-6">
            {`Thanks, ${form.name}! We'll contact you at ${form.email} or ${form.mobile}`}
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left text-sm text-gray-600 mb-6">
            <p className="font-semibold mb-2">
              What happens next?
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>We will review your request.</li>
              <li>Our team will contact you via email or mobile.</li>
              <li>We will assist you in setting up your resort.</li>
              <li>You will receive your private access link.</li>
            </ul>
          </div>

          <button
            onClick={() => router.push('/')}
            className="cursor-pointer w-full bg-green-600 text-white py-3 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Get Started with Our Booking System
          </h1>

          <p className="text-gray-600 mt-2">
            We onboard resort owners manually to ensure quality and proper setup.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            How it works
          </h2>

          <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm">
            <li>Fill out the form below with your details.</li>
            <li>We will review your request.</li>
            <li>We will contact you to help set up your account.</li>
            <li>You will receive an invitation link to access your dashboard.</li>
          </ul>
        </div>

        {partnerAgent && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded mb-4 text-sm">
            Referred by partner: <strong>{partnerAgent.name}</strong>
          </div>
        )}
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 space-y-4"
        >
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full border p-3 rounded"
            required
          />

          <input
            name="mobile"
            value={form.mobile}
            // onChange={handleChange}
            onChange={(e) => {
              // allow only numbers and +
              const value = e.target.value.replace(/[^\d+]/g, '')
              handleChange({ target: { value, name: "mobile" } })
              // setFormContact(value)
            }}
            placeholder="Mobile Number"
            className="w-full border p-3 rounded"
          />

          <input
            name="resort_name"
            value={form.resort_name}
            onChange={handleChange}
            placeholder="Resort Name"
            className="w-full border p-3 rounded"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your resort or requirements"
            className="w-full border p-3 rounded min-h-[120px]"
          />

          <button
            disabled={
              loading
              || !form.name
              || !form.email
              || !form.mobile
              || !form.resort_name
              || !form.mobile
            }
            className="cursor-pointer w-full bg-green-600 text-white py-3 rounded disabled:bg-gray-400"
          >
            {loading ? 'Sending...' : 'Request Access'}
          </button>
        </form>
      </div>
    </div>
  )
}