"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Search, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"

interface Quotation {
  id: string
  quotation_number: string
  customer_name: string
  grand_total: number
  created_at: string
  pdf_url: string | null
}

export default function SalesQuotations() {
  const supabase = createClient()

  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          setLoading(false)
          return
        }

        const userId = session.user.id

        const { data, error } = await supabase
          .from("quotations")
          .select(`
            id,
            quotation_number,
            customer_name,
            grand_total,
            created_at,
            pdf_url
          `)
          .eq("created_by", userId)
          .order("created_at", { ascending: false })

        if (error) {
          toast.error(error.message)
        } else {
          setQuotations(data || [])
        }

        setLoading(false)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const filtered = quotations.filter(
    (q) =>
      q.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.quotation_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">

      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-black hover:shadow-sm transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">
            My Quotations
          </h1>
          <p className="text-sm font-medium text-gray-400">
            Track your generated quotations.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>PDF</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>Loading...</TableCell>
            </TableRow>
          ) : filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>No quotations found</TableCell>
            </TableRow>
          ) : (
            filtered.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.quotation_number}</TableCell>
                <TableCell>{q.customer_name}</TableCell>
                <TableCell>₹{q.grand_total}</TableCell>
                <TableCell>
                  {new Date(q.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {q.pdf_url && (
                    <a
                      href={q.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
