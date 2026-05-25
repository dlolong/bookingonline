'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'

function createSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function isValidMobileNumber(value) {
    const cleaned = value.replace(/\s+/g, '')

    const regex = /^(09|\+639|639)\d{9}$/
    return regex.test(cleaned)
}

function normalizeMobile(value) {
    if (value.startsWith('09')) {
        return '+63' + value.slice(1)
    }
    if (value.startsWith('639')) {
        return '+' + value
    }
    return value
}

export default function PartnerRegisterPage() {
    const { showToast } = useApp()

    const [agent, setAgent] = useState(null)
    const [loading, setLoading] = useState(false)
    const [copyText, setCopyText] = useState('Copy Link')


    const [form, setForm] = useState({
        name: '',
        email: '',
        mobile: '',
    })

    const referralLink =
        agent && typeof window !== 'undefined'
            ? `${window.location.origin}/contact?partner=${agent.slug}`
            : ''

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

        const slug = createSlug(form.name)

        const { data, error } = await supabase
            .from('partner_agents')
            .insert([
                {
                    name: form.name,
                    email: form.email,
                    mobile: normalizeMobile(form.mobile),
                    slug,
                    status: 'pending',
                },
            ])
            .select()
            .single()

        setLoading(false)

        if (error) {
            showToast({
                type: 'error',
                message: error.message,
            })
            return
        }

        setAgent(data)
    }

    const copyLink = async () => {
        await navigator.clipboard.writeText(referralLink)
        setCopyText('Copied!')
        setTimeout(() => setCopyText('Copy Link'), 1500)
    }

    if (agent) {
        return (
            <div className="flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow p-6 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-2">
                        Partner Registration Sent
                    </h1>

                    <p className="text-gray-600 mb-4">
                        Once approved, you can share this link to refer resort owners.
                    </p>

                    <div className="bg-gray-50 p-3 rounded text-sm break-all mb-4">
                        {referralLink}
                    </div>

                    <button
                        onClick={copyLink}
                        className="w-full bg-green-600 text-white p-3 rounded"
                    >
                        {copyText}
                    </button>
                    <p className="text-xs text-gray-500 mt-4">
                        Share this link with resort owners. When they request access using your link and become a paying customer, your monthly commission will be tracked.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center p-6">



            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow p-6 max-w-md w-full space-y-3"
            >
                <h1 className="text-2xl font-bold">Become a Partner Agent</h1>

                <input
                    placeholder="Full Name"
                    className="w-full border p-3 rounded"
                    value={form.name}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                />

                <input
                    name="contact"
                    value={form.mobile}
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^\d+]/g, '')
                        setForm((p) => ({ ...p, mobile: value }))
                    }}
                    placeholder="09XXXXXXXXX"
                    className="w-full border px-3 py-2.5 sm:p-3 rounded"
                    maxLength={13}
                />

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-3 rounded"
                    value={form.email}
                    onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                />

                <button
                    disabled={loading || !form.mobile || !form.email}
                    className="w-full bg-green-600 text-white p-3 rounded disabled:bg-gray-400"
                >
                    {loading ? 'Submitting...' : 'Register as Partner'}
                </button>
            </form>
        </div>
    )
}