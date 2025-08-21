"use client"

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteAccount } from '@/hooks/use-delete-account'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { deleteAccount, isDeleting } = useDeleteAccount()
  const [confirmText, setConfirmText] = useState('')
  const [isConfirmed, setIsConfirmed] = useState(false)

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmText(value)
    setIsConfirmed(value === '탈퇴')
  }

  const handleDelete = async () => {
    if (!isConfirmed) return

    const result = await deleteAccount()
    if (result.success) {
      onClose()
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setIsConfirmed(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            계정 탈퇴
          </DialogTitle>
          <DialogDescription>
            계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-2">⚠️ 주의사항</p>
                <ul className="space-y-1 text-xs">
                  <li>• 모든 비즈니스 카드 정보가 삭제됩니다</li>
                  <li>• 수집한 명함들이 모두 삭제됩니다</li>
                  <li>• 이벤트 참가 기록이 삭제됩니다</li>
                  <li>• 생성한 이벤트가 모두 삭제됩니다</li>
                  <li>• 프로필 정보가 완전히 삭제됩니다</li>
                  <li>• 이 작업은 되돌릴 수 없습니다</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              계속하려면 <span className="font-mono bg-gray-100 px-1 rounded">탈퇴</span>를 입력하세요
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={handleConfirmChange}
              placeholder="탈퇴"
              className={isConfirmed ? 'border-green-500 bg-green-50' : ''}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                계정 삭제
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
