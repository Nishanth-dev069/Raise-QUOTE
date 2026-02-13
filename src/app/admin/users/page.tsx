"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Plus, Search, Key, Power, PowerOff, Edit2 } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import {
  createSalesperson,
  toggleUserStatus,
  resetUserPassword,
} from "./actions"

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  active: boolean
  created_at: string
  phone: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
    phone: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, active, created_at, phone")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data as Profile[])
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // CREATE USER
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    const fd = new FormData()
    fd.append("name", formData.name)
    fd.append("email", formData.email)
    fd.append("password", formData.password)

    const result = await createSalesperson(fd)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("User created successfully")
      setIsCreateOpen(false)
      fetchUsers()
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "sales",
        phone: "",
      })
    }
  }

  // TOGGLE STATUS
  const handleToggleStatus = async (user: Profile) => {
    const result = await toggleUserStatus(user.id, !user.active)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        `User ${user.active ? "deactivated" : "activated"} successfully`
      )
      fetchUsers()
    }
  }

  // RESET PASSWORD
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    const result = await resetUserPassword(
      selectedUser.id,
      formData.password
    )

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Password reset successfully")
      setIsResetOpen(false)
      setFormData({ ...formData, password: "" })
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">
            Users
          </h1>
          <p className="text-sm font-medium text-gray-400">
            Manage your sales team and administrators.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white">
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </DialogTrigger>

          <DialogContent className="rounded-2xl sm:max-w-[425px]">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Enter details to create account.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <Input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <button
                  type="submit"
                  className="w-full bg-black text-white rounded-xl py-3"
                >
                  Create User
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-bold">{user.full_name}</div>
                  <div className="text-xs text-gray-400">
                    {user.email}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge>{user.role}</Badge>
              </TableCell>

              <TableCell>
                {user.active ? "Active" : "Inactive"}
              </TableCell>

              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>

              <TableCell className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user)
                    setIsResetOpen(true)
                  }}
                >
                  <Key className="h-4 w-4" />
                </button>

                <button onClick={() => handleToggleStatus(user)}>
                  {user.active ? (
                    <PowerOff className="h-4 w-4" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* RESET PASSWORD DIALOG */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent>
          <form onSubmit={handleResetPassword}>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter new password for {selectedUser?.full_name}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label>New Password</Label>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <button
                type="submit"
                className="w-full bg-black text-white rounded-xl py-3"
              >
                Update Password
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
