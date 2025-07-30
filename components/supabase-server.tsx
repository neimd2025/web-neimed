import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function SupabaseServer() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-4">
      {user ? (
        <div>
          <h2 className="text-lg font-bold">서버 사이드 사용자 정보</h2>
          <p>이메일: {user.email}</p>
          <p>ID: {user.id}</p>
          <p>생성일: {new Date(user.created_at).toLocaleDateString('ko-KR')}</p>
        </div>
      ) : (
        <div>
          <p>로그인되지 않은 사용자입니다.</p>
        </div>
      )}
    </div>
  )
}
