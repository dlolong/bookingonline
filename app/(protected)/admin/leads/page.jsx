'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useApp } from '@/context/AppContext'
import Loader from '@/components/Loader'
// export default function AdminPage() {
//   return <div>Admin Leads</div>
// }
export default function AdminLeadsPage() {
    const { profile, showToast } = useApp()

    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLeads = async () => {
        setLoading(true)

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            showToast({
                type: 'error',
                message: 'Failed to load leads.',
            })
        } else {
            setLeads(data || [])
        }

        setLoading(false)
    }

    const updateStatus = async (leadId, status) => {
        const { error } = await supabase
            .from('leads')
            .update({ status })
            .eq('id', leadId)

        if (error) {
            showToast({
                type: 'error',
                message: 'Failed to update lead.',
            })
            return
        }

        showToast({
            type: 'success',
            message: 'Lead updated.',
        })

        fetchLeads()
    }

    useEffect(() => {
        let cancelled = false

        async function loadLeads() {
            if (!profile) return

            if (profile.role !== 'admin') {
                if (!cancelled) setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (cancelled) return

            if (error) {
                showToast({
                    type: 'error',
                    message: 'Failed to load leads.',
                })
            } else {
                setLeads(data || [])
            }

            setLoading(false)
        }

        loadLeads()

        return () => {
            cancelled = true
        }
    }, [profile, showToast])

    if (loading) return <Loader text="Loading leads..." />

    if (profile?.role !== 'admin') {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">
                    Access denied
                </h1>
                <p className="text-gray-500">
                    You do not have permission to view this page.
                </p>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-gray-500 text-sm">
                        Request access submissions
                    </p>
                </div>

                <button
                    onClick={fetchLeads}
                    className="border px-4 py-2 rounded"
                >
                    Refresh
                </button>
            </div>

            <div className="grid gap-4">
                {leads.length === 0 ? (
                    <p className="text-gray-500">No leads yet.</p>
                ) : (
                    leads.map((lead) => (
                        <div
                            key={lead.id}
                            className="bg-white border rounded-2xl shadow-sm p-5"
                        >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold">
                                        {lead.resort_name || 'Unnamed Resort'}
                                    </h2>

                                    <p className="text-sm text-gray-600">
                                        {lead.name}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        {lead.email}
                                    </p>

                                    {lead.mobile && (
                                        <p className="text-sm text-gray-600">
                                            {lead.mobile}
                                        </p>
                                    )}
                                </div>

                                <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 w-fit">
                                    {lead.status}
                                </span>
                            </div>

                            {lead.message && (
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mt-4">
                                    {lead.message}
                                </p>
                            )}

                            <p className="text-xs text-gray-400 mt-3">
                                Submitted: {new Date(lead.created_at).toLocaleString()}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                <button
                                    onClick={() => updateStatus(lead.id, 'contacted')}
                                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
                                >
                                    Mark Contacted
                                </button>

                                <button
                                    onClick={() => updateStatus(lead.id, 'approved')}
                                    className="bg-green-600 text-white px-3 py-2 rounded text-sm"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => updateStatus(lead.id, 'rejected')}
                                    className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}