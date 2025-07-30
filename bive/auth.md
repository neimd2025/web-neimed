# 🔐 Supabase 인증 시스템 완전 구현 가이드

**복사-붙여넣기만으로 완성되는 인증 시스템**
✅ 이메일 회원가입/로그인
✅ 카카오/구글 OAuth
✅ 이메일 인증
✅ 헤더/사이드바 연동
✅ Welcome 페이지
✅ 에러 처리

---

## 📋 **1단계: 환경 설정**

### 1.1 패키지 설치
```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add framer-motion lucide-react
pnpm add next-intl  # 다국어 지원 시
```

### 1.2 환경 변수 설정 (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.3 Supabase 대시보드 설정

**Authentication > URL Configuration:**
```
Site URL: http://localhost:3000
Redirect URLs:
- http://localhost:3000/ko/auth/callback
- http://localhost:3000/en/auth/callback
- http://localhost:3000/ja/auth/callback
- http://localhost:3000/zh/auth/callback
- http://localhost:3000/ko/auth/confirm
- http://localhost:3000/en/auth/confirm
- http://localhost:3000/ja/auth/confirm
- http://localhost:3000/zh/auth/confirm
```

**Authentication > Providers:**
- ✅ Email: Enable
- ✅ Kakao: Enable (Client ID, Secret 입력)
- ✅ Google: Enable (Client ID, Secret 입력)

---

## 📋 **2단계: Supabase 클라이언트 설정**

### 2.1 클라이언트 생성 (utils/supabase/client.ts)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2.2 서버 클라이언트 생성 (utils/supabase/server.ts)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출된 경우 무시
          }
        },
      },
    }
  )
}
```

### 2.3 미들웨어 설정 (utils/supabase/middleware.ts)
```typescript
import { routing } from '@/i18n/routing'  // next-intl 사용 시
import { createServerClient } from '@supabase/ssr'
import createMiddleware from 'next-intl/middleware'  // next-intl 사용 시
import { NextResponse, type NextRequest } from 'next/server'

// next-intl 미들웨어 생성 (다국어 지원 시)
const intlMiddleware = createMiddleware(routing)

export async function updateSession(request: NextRequest) {
  // 1. next-intl 미들웨어 실행 (다국어 지원 시)
  let response = intlMiddleware(request)
  if (response.status !== 200) {
    return response
  }

  // 2. Supabase 세션 업데이트
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 사용자 세션 확인
  const { data: { user } } = await supabase.auth.getUser()

  return supabaseResponse
}
```

### 2.4 메인 미들웨어 (middleware.ts)
```typescript
import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 📋 **3단계: 인증 상태 관리 Hook**

### 3.1 useAuth Hook (hooks/use-auth.ts)
```typescript
"use client"

import { createClient } from '@/utils/supabase/client'
import { Session, User } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })

  const params = useParams()
  const locale = params?.locale || 'ko'
  const supabase = createClient()

  useEffect(() => {
    // 초기 세션 가져오기
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()

    // 인증 상태 변화 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignInWithKakao = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/${locale}/auth/callback`,
          queryParams: {
            scope: 'profile_nickname,profile_image,account_email'
          }
        }
      })
      if (error) {
        console.error('Kakao login error:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to sign in with Kakao:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
    } catch (error) {
      console.error('Failed to sign out:', error)
      throw error
    }
  }

  return {
    ...authState,
    signInWithKakao: handleSignInWithKakao,
    signOut: handleSignOut
  }
}
```

---

## 📋 **4단계: 회원가입 페이지**

### 4.1 회원가입 페이지 (app/[locale]/auth/signup/page.tsx)
```typescript
'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'  // next-intl 사용 시
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Chrome, Eye, EyeOff, Mail, UserPlus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string || 'ko'
  const supabase = createClient()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.')
      setMessageType('error')
      return
    }

    if (password.length < 6) {
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/auth/confirm`
        }
      })

      if (error) {
        console.error('❌ Signup error:', error)
        if (error.message.includes('already registered')) {
          setMessage('이미 가입된 이메일입니다. 로그인을 시도해주세요.')
        } else {
          setMessage('회원가입 중 오류가 발생했습니다.')
        }
        setMessageType('error')
        return
      }

      if (data?.user && !data.session) {
        setMessage(`${email}로 인증 메일을 보냈습니다. 이메일을 확인하고 인증 링크를 클릭해주세요.`)
        setMessageType('success')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else if (data?.session) {
        router.push(`/${locale}/auth/welcome`)
      }

    } catch (error) {
      console.error('❌ Unexpected signup error:', error)
      setMessage('예상치 못한 오류가 발생했습니다.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignup = async (provider: 'google' | 'kakao') => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${locale}/auth/callback`
        }
      })

      if (error) {
        console.error(`❌ ${provider} OAuth error:`, error)
        setMessage(`${provider === 'kakao' ? '카카오' : '구글'} 로그인 중 오류가 발생했습니다.`)
        setMessageType('error')
      }
    } catch (error) {
      console.error(`❌ Unexpected ${provider} OAuth error:`, error)
      setMessage('예상치 못한 오류가 발생했습니다.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              회원가입
            </CardTitle>
            <CardDescription className="text-gray-600">
              새 계정을 만들어 시작하세요
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={() => handleOAuthSignup('kakao')}
                disabled={isLoading}
                className="w-full h-11 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                <div className="w-5 h-5 mr-2 bg-black rounded"></div>
                카카오로 계속하기
              </Button>

              <Button
                onClick={() => handleOAuthSignup('google')}
                disabled={isLoading}
                variant="outline"
                className="w-full h-11 border-gray-300 hover:"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google로 계속하기
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">또는</span>
              </div>
            </div>

            {/* 메시지 표시 */}
            {message && (
              <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* 이메일 회원가입 폼 */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6자 이상 입력"
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력"
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    처리 중...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    이메일로 가입하기
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-gray-600 text-center">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                로그인하기
              </Link>
            </div>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
```

---

## 📋 **5단계: 로그인 페이지**

### 5.1 로그인 페이지 (app/[locale]/auth/login/page.tsx)
```typescript
'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { ArrowLeft, Chrome, Eye, EyeOff, LogIn } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string || 'ko'
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setMessage('이메일과 비밀번호를 모두 입력해주세요.')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        if (error.message.includes('Invalid login credentials')) {
          setMessage('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message.includes('Email not confirmed')) {
          setMessage('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.')
        } else {
          setMessage('로그인 중 오류가 발생했습니다.')
        }
        setMessageType('error')
        return
      }

      if (data.user && data.session) {
        console.log('✅ Login successful:', data.user.email)
        router.push(`/${locale}`)
      }

    } catch (error) {
      console.error('❌ Unexpected login error:', error)
      setMessage('예상치 못한 오류가 발생했습니다.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${locale}/auth/callback`
        }
      })

      if (error) {
        console.error(`❌ ${provider} OAuth error:`, error)
        setMessage(`${provider === 'kakao' ? '카카오' : '구글'} 로그인 중 오류가 발생했습니다.`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('예상치 못한 오류가 발생했습니다.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              로그인
            </CardTitle>
            <CardDescription className="text-gray-600">
              계정에 로그인하세요
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={() => handleOAuthLogin('kakao')}
                disabled={isLoading}
                className="w-full h-11 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              >
                <div className="w-5 h-5 mr-2 bg-black rounded"></div>
                카카오로 로그인
              </Button>

              <Button
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                variant="outline"
                className="w-full h-11 border-gray-300 hover:"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google로 로그인
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">또는</span>
              </div>
            </div>

            {/* 메시지 표시 */}
            {message && (
              <Alert className={messageType === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={messageType === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {/* 이메일 로그인 폼 */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    로그인 중...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </>
                )}
              </Button>

              {/* 비밀번호 찾기 */}
              <div className="text-center">
                <Link href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-gray-600 text-center">
              아직 계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                회원가입하기
              </Link>
            </div>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
```

---

## 📋 **6단계: 인증 라우트 핸들러**

### 6.1 이메일 인증 확인 (app/[locale]/auth/confirm/route.ts)
```typescript
import { createClient } from '@/utils/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  console.log('🔄 Email confirmation processing started')
  const locale = request.nextUrl.pathname.split('/')[1] || 'ko'

  // 이메일 인증 처리
  if (token_hash && type) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })

      if (error) {
        console.error('❌ Email verification failed:', error)
        return NextResponse.redirect(
          new URL(`/${locale}/auth/error?message=${encodeURIComponent('이메일 인증에 실패했습니다.')}`, origin)
        )
      }

      if (data.user) {
        console.log('✅ Email verification successful:', data.user.email)

        // 신규 가입자인지 확인
        const isNewSignup = type === 'email' && data.user.email_confirmed_at

        if (isNewSignup) {
          return NextResponse.redirect(new URL(`/${locale}/auth/welcome`, origin))
        } else {
          const redirectTo = new URL(next, origin)
          return NextResponse.redirect(redirectTo)
        }
      }
    } catch (error) {
      console.error('❌ Email verification processing error:', error)
      return NextResponse.redirect(
        new URL(`/${locale}/auth/error?message=${encodeURIComponent('이메일 인증 처리 중 오류가 발생했습니다.')}`, origin)
      )
    }
  }

  // 세션 확인
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      return NextResponse.redirect(new URL(`/${locale}`, origin))
    }
  } catch (error) {
    console.error('❌ Session check error:', error)
  }

  // 인증 정보 누락
  return NextResponse.redirect(
    new URL(`/${locale}/auth/error?message=${encodeURIComponent('이메일 인증 정보가 누락되었습니다.')}`, origin)
  )
}
```

### 6.2 OAuth 콜백 처리 (app/[locale]/auth/callback/route.ts)
```typescript
import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const locale = request.nextUrl.pathname.split('/')[1] || 'ko'

  // OAuth 에러 처리
  if (error) {
    console.error('❌ OAuth error from provider:', error)
    return NextResponse.redirect(
      new URL(`/${locale}/auth/error?message=${encodeURIComponent('OAuth 로그인 중 오류가 발생했습니다.')}`, origin)
    )
  }

  // OAuth 코드 처리
  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ OAuth code exchange failed:', error)
        return NextResponse.redirect(
          new URL(`/${locale}/auth/error?message=${encodeURIComponent('OAuth 인증 처리 중 오류가 발생했습니다.')}`, origin)
        )
      }

      if (data.user && data.session) {
        console.log('✅ OAuth login successful:', data.user.email)

        // 신규 사용자 확인
        const createdAt = new Date(data.user.created_at)
        const lastSignInAt = new Date(data.user.last_sign_in_at || data.user.created_at)
        const timeDiff = Math.abs(lastSignInAt.getTime() - createdAt.getTime())
        const isNewUser = timeDiff < 10000 // 10초 이내면 신규 사용자

        if (isNewUser) {
          return NextResponse.redirect(new URL(`/${locale}/auth/welcome`, origin))
        } else {
          return NextResponse.redirect(new URL(`/${locale}`, origin))
        }
      }
    } catch (error) {
      console.error('❌ OAuth processing error:', error)
      return NextResponse.redirect(
        new URL(`/${locale}/auth/error?message=${encodeURIComponent('OAuth 처리 중 예상치 못한 오류가 발생했습니다.')}`, origin)
      )
    }
  }

  // 기본 리다이렉트
  return NextResponse.redirect(
    new URL(`/${locale}/auth/error?message=${encodeURIComponent('OAuth 인증 정보를 찾을 수 없습니다.')}`, origin)
  )
}
```

---

## 📋 **7단계: Welcome 페이지**

### 7.1 Welcome 페이지 (app/[locale]/auth/welcome/page.tsx)
```typescript
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import {
    ArrowRight,
    CheckCircle,
    Gamepad2,
    Gift,
    ShoppingCart,
    Sparkles,
    Target,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function WelcomePage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 사용자 표시 이름 가져오기
  const getUserDisplayName = () => {
    if (!user) return "사용자"

    if (user.app_metadata?.provider === 'kakao') {
      return user.user_metadata?.nickname ||
             user.user_metadata?.full_name ||
             user.email?.split('@')[0] ||
             "사용자"
    }

    return user.user_metadata?.full_name ||
           user.email?.split('@')[0] ||
           "사용자"
  }

  const features = [
    {
      icon: Target,
      title: "게임 참여",
      description: "다양한 게임에 참여하세요",
      href: "/games",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ShoppingCart,
      title: "쇼핑몰",
      description: "상품을 둘러보고 구매하세요",
      href: "/shop",
      color: "from-green-500 to-emerald-500"
    }
  ]

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold"
            >
              환영합니다!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl opacity-90"
            >
              {getUserDisplayName()}님, 가입을 축하드립니다!
            </motion.p>
          </CardHeader>

          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                이제 모든 기능을 이용하실 수 있습니다!
              </h2>
              <p className="text-gray-600">
                다양한 기능들을 탐험해보세요
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <motion.div
                    key={feature.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link href={feature.href}>
                      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-gray-200">
                        <CardContent className="p-6 text-center">
                          <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/">
                  <Sparkles className="w-5 h-5 mr-2" />
                  시작하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
```

---

## 📋 **8단계: 에러 페이지**

### 8.1 에러 페이지 (app/[locale]/auth/error/page.tsx)
```typescript
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '인증 중 오류가 발생했습니다.'

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </motion.div>

            <CardTitle className="text-2xl font-bold text-red-600">
              인증 오류
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {message}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              문제가 지속된다면 다시 시도하거나 고객지원에 문의해주세요.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              asChild
            >
              <Link href="/auth/login">
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 로그인하기
              </Link>
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
```

---

## 📋 **9단계: 헤더 연동**

### 9.1 헤더 컴포넌트 (components/header.tsx)
```typescript
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from '@/utils/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { LogIn, LogOut, User, Menu } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Supabase Auth 상태 관리
  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Auth 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // 로그아웃 처리
  const handleSignOut = async () => {
    try {
      console.log('🔄 Starting sign out process')
      await supabase.auth.signOut()
      console.log('✅ Sign out successful')
      window.location.href = '/'
    } catch (error) {
      console.error('❌ Sign out error:', error)
    }
  }

  // 사용자 표시 이름
  const getUserDisplayName = () => {
    if (!user) return "사용자"

    if (user.app_metadata?.provider === 'kakao') {
      return user.user_metadata?.nickname ||
             user.user_metadata?.full_name ||
             user.email?.split('@')[0] ||
             "사용자"
    }

    return user.user_metadata?.full_name ||
           user.email?.split('@')[0] ||
           "사용자"
  }

  // 사용자 아바타 URL
  const getUserAvatarUrl = () => {
    if (!user) return undefined

    if (user.app_metadata?.provider === 'kakao') {
      return user.user_metadata?.avatar_url ||
             user.user_metadata?.picture
    }

    return user.user_metadata?.avatar_url ||
           user.user_metadata?.picture
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">MyApp</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            ) : user ? (
              // 로그인된 사용자
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserAvatarUrl()} alt={getUserDisplayName()} />
                      <AvatarFallback>
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/games">
                      <Menu className="mr-2 h-4 w-4" />
                      내 게임
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 로그인되지 않은 사용자
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    로그인
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">회원가입</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
```

---

## 📋 **10단계: Next.js 설정**

### 10.1 Next.js 설정 (next.config.mjs)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google 프로필 이미지
      'k.kakaocdn.net', // 카카오 프로필 이미지
      't1.kakaocdn.net', // 카카오 프로필 이미지
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ]
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
};

export default nextConfig;
```

### 10.2 Package.json engines 설정
```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

## 📋 **11단계: 파일 구조**

```
your-project/
├── app/
│   └── [locale]/
│       ├── auth/
│       │   ├── login/
│       │   │   └── page.tsx
│       │   ├── signup/
│       │   │   └── page.tsx
│       │   ├── welcome/
│       │   │   └── page.tsx
│       │   ├── error/
│       │   │   └── page.tsx
│       │   ├── confirm/
│       │   │   └── route.ts
│       │   └── callback/
│       │       └── route.ts
│       └── layout.tsx
├── components/
│   ├── ui/
│   │   └── [shadcn components]
│   └── header.tsx
├── hooks/
│   └── use-auth.ts
├── utils/
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── middleware.ts
├── middleware.ts
├── next.config.mjs
└── package.json
```

---

## 📋 **12단계: 테스트 가이드**

### 12.1 기능 테스트 체크리스트

**✅ 이메일 회원가입/로그인**
- [ ] 회원가입 폼 작동
- [ ] 이메일 인증 메일 발송
- [ ] 인증 링크 클릭 시 Welcome 페이지 이동
- [ ] 로그인 폼 작동
- [ ] 잘못된 정보 입력 시 에러 메시지

**✅ OAuth 로그인**
- [ ] 카카오 로그인 버튼 작동
- [ ] 구글 로그인 버튼 작동
- [ ] OAuth 인증 후 Welcome 페이지 이동 (신규)
- [ ] OAuth 인증 후 홈 페이지 이동 (기존)

**✅ 인증 상태 관리**
- [ ] 헤더에 사용자 정보 표시
- [ ] 로그아웃 기능 작동
- [ ] 페이지 새로고침 시 로그인 상태 유지

**✅ 에러 처리**
- [ ] 잘못된 인증 링크 클릭 시 에러 페이지
- [ ] OAuth 에러 시 에러 페이지
- [ ] 네트워크 에러 시 적절한 메시지

---

## 🎉 **완료!**

**이제 복사-붙여넣기만으로 완전한 인증 시스템이 구현됩니다!**

### 🚀 **주요 기능:**
- ✅ 이메일 회원가입/로그인
- ✅ 카카오/구글 OAuth
- ✅ 이메일 인증 플로우
- ✅ 인증 상태 관리
- ✅ 에러 처리
- ✅ 다국어 지원 (선택)
- ✅ 반응형 UI

### 📞 **지원:**
문제가 있을 경우 Supabase 공식 문서를 참조하거나 이슈를 제보해주세요!
