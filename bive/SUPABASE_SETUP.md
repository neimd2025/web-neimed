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
```

### 1.2 환경 변수 설정 (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://teushntbatpydupjpsnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRldXNobnRiYXRweWR1cGpwc250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzOTg3MzcsImV4cCI6MjA2Nzk3NDczN30.mY6egrlQJFOPBFiecXnDGzUvqIowDoCHR8QFZSNn2yQ

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.3 Supabase 대시보드 설정

**Authentication > URL Configuration:**
```
Site URL: http://localhost:3000
Redirect URLs:
- http://localhost:3000/auth/callback
- http://localhost:3000/auth/confirm
```

**Authentication > Providers:**
- ✅ Email: Enable
- ✅ Kakao: Enable (Client ID, Secret 입력)
- ✅ Google: Enable (Client ID, Secret 입력)

---

## 📋 **2단계: 파일 구조**

```
web-named/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # 로그인 페이지
│   │   ├── signup/
│   │   │   └── page.tsx          # 회원가입 페이지
│   │   ├── welcome/
│   │   │   └── page.tsx          # 환영 페이지
│   │   ├── error/
│   │   │   └── page.tsx          # 에러 페이지
│   │   ├── confirm/
│   │   │   └── route.ts          # 이메일 인증 처리
│   │   └── callback/
│   │       └── route.ts          # OAuth 콜백 처리
│   ├── home/
│   │   └── page.tsx              # 로그인된 사용자 홈
│   └── page.tsx                  # 메인 페이지
├── components/
│   ├── ui/                       # shadcn/ui 컴포넌트들
│   └── header.tsx                # 헤더 컴포넌트
├── hooks/
│   └── use-auth.ts               # 인증 상태 관리 Hook
├── utils/
│   └── supabase/
│       ├── client.ts             # 클라이언트 Supabase
│       ├── server.ts             # 서버 Supabase
│       └── middleware.ts         # 미들웨어 Supabase
├── middleware.ts                  # Next.js 미들웨어
└── next.config.mjs               # Next.js 설정
```

---

## 📋 **3단계: 주요 기능**

### 3.1 인증 플로우

**이메일 회원가입:**
1. 사용자가 회원가입 폼 작성
2. 이메일 인증 메일 발송
3. 사용자가 인증 링크 클릭
4. Welcome 페이지로 이동

**OAuth 로그인:**
1. 사용자가 카카오/구글 로그인 버튼 클릭
2. OAuth 제공자로 리다이렉트
3. 인증 완료 후 콜백 처리
4. 신규 사용자는 Welcome 페이지, 기존 사용자는 홈으로 이동

### 3.2 인증 상태 관리

- `useAuth` Hook으로 전역 인증 상태 관리
- 헤더에서 로그인/로그아웃 상태 표시
- 미들웨어로 인증 상태에 따른 자동 리다이렉트

### 3.3 에러 처리

- 이메일 인증 실패 시 에러 페이지
- OAuth 인증 실패 시 에러 페이지
- 네트워크 에러 시 적절한 메시지 표시

---

## 📋 **4단계: 사용 방법**

### 4.1 개발 서버 시작
```bash
pnpm dev
```

### 4.2 테스트 체크리스트

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

## 📋 **5단계: Supabase 프로젝트 설정**

### 5.1 OAuth 제공자 설정

**카카오:**
1. Kakao Developers에서 앱 생성
2. Client ID와 Secret을 Supabase에 입력
3. Redirect URI 설정: `https://your-project.supabase.co/auth/v1/callback`

**구글:**
1. Google Cloud Console에서 OAuth 2.0 클라이언트 생성
2. Client ID와 Secret을 Supabase에 입력
3. Redirect URI 설정: `https://your-project.supabase.co/auth/v1/callback`

### 5.2 데이터베이스 스키마 (선택사항)

```sql
-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

## 📋 **6단계: 문제 해결**

### 6.1 일반적인 문제들

**환경 변수가 로드되지 않는 경우**
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버를 재시작

**인증이 작동하지 않는 경우**
- Supabase 프로젝트 설정 확인
- OAuth 리다이렉트 URL 설정 확인

**CORS 오류**
- Supabase 프로젝트 설정에서 허용된 도메인 확인

### 6.2 디버깅 팁

- 브라우저 개발자 도구에서 네트워크 탭 확인
- Supabase 대시보드에서 로그 확인
- 콘솔에서 에러 메시지 확인

---

## 🎉 **완료!**

**이제 복사-붙여넣기만으로 완전한 인증 시스템이 구현됩니다!**

### 🚀 **주요 기능:**
- ✅ 이메일 회원가입/로그인
- ✅ 카카오/구글 OAuth
- ✅ 이메일 인증 플로우
- ✅ 인증 상태 관리
- ✅ 에러 처리
- ✅ 반응형 UI
- ✅ 애니메이션 효과

### 📞 **지원:**
문제가 있을 경우 Supabase 공식 문서를 참조하거나 이슈를 제보해주세요!

---

## 📝 **추가 개발 가이드**

### 사용자 프로필 관리
```typescript
// 프로필 업데이트 예시
const updateProfile = async (updates: any) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...updates })
}
```

### 보호된 라우트
```typescript
// 서버 컴포넌트에서 인증 확인
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  redirect('/auth/login')
}
```

### 클라이언트 컴포넌트에서 인증 확인
```typescript
const { user, loading } = useAuth()

if (loading) return <div>로딩 중...</div>
if (!user) return <div>로그인이 필요합니다.</div>
```
