'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Key, Power, PowerOff, Trash2 } from 'lucide-react'
import {
  toggleUserStatus,
  resetUserPassword,
  deleteUser,
} from './actions'
import { toast } from 'sonner'

export default function UserActions({ user }: { user: any }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    setIsLoading(true)
    const result = await deleteUser(user.id)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('User deleted successfully')
      setIsDeleteOpen(false)
    }
  }

  async function handleToggle() {
    const result = await toggleUserStatus(user.id, !user.active)
    if (result.error) toast.error(result.error)
    else toast.success('User status updated')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 hover:bg-gray-100 transition-all"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
          <DropdownMenuItem
            onClick={handleToggle}
            className="cursor-pointer"
          >
            {user.active ? (
              <>
                <PowerOff className="mr-2 h-4 w-4 text-red-500" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4 text-emerald-500" />
                Activate
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="cursor-pointer text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Delete {user.full_name}?
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            This action cannot be undone.
          </p>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>

            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
