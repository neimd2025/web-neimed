# SNS 로그인 설정 가이드

웹 네임드 프로젝트의 SNS 로그인 기능을 활성화하기 위한 설정 가이드입니다.

## 📋 개요

현재 구현된 SNS 로그인 제공자:
- ✅ **Google** - Supabase OAuth 지원
- ✅ **Kakao** - Supabase OAuth 지원  
- ⚠️ **Naver** - 별도 구현 필요 (준비 중)

## 🔧 Supabase 설정

### 1. Supabase 대시보드 접속
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 `Authentication` → `Providers` 이동

### 2. Google OAuth 설정

#### Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. `APIs & Services` → `Credentials` 이동
4. `Create Credentials` → `OAuth 2.0 Client IDs` 선택
5. Application type: `Web application` 선택
6. **Authorized redirect URIs** 추가:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Client ID와 Client Secret 복사

#### Supabase에서 Google Provider 활성화
1. Supabase Dashboard의 Authentication → Providers
2. Google 토글 활성화
3. Google Client ID 입력
4. Google Client Secret 입력
5. 저장

### 3. Kakao OAuth 설정

#### Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com) 접속
2. 내 애플리케이션 → 애플리케이션 추가
3. 앱 정보 입력 후 생성
4. `카카오 로그인` 메뉴에서 활성화 설정
5. **Redirect URI** 추가:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. REST API 키 복사

#### Supabase에서 Kakao Provider 활성화
1. Supabase Dashboard의 Authentication → Providers
2. 하단 `Add a new provider` 클릭
3. Provider: `Kakao` 선택
4. Kakao Client ID (REST API 키) 입력
5. 저장

### 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OAuth Redirect URL (개발/배포 환경에 따라 변경)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🚀 배포 환경 설정

### Vercel 배포 시
1. Vercel Dashboard → 프로젝트 설정
2. Environment Variables에 다음 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   ```

### OAuth Redirect URL 업데이트
배포 후 각 OAuth 제공자의 Redirect URI를 배포 URL로 업데이트:
- Google Cloud Console: `https://your-domain.com/auth/callback`
- Kakao Developers: `https://your-domain.com/auth/callback`

## 🔍 테스트 방법

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. `/login` 페이지 접속

3. 각 SNS 로그인 버튼 테스트:
   - Google 로그인 버튼 클릭
   - Kakao 로그인 버튼 클릭
   - Naver 로그인 버튼 클릭 (현재는 준비 중 메시지 표시)

## ⚠️ 네이버 로그인 구현 예정

네이버 로그인은 Supabase에서 기본 제공하지 않으므로, 다음 방식으로 구현 예정:

### 구현 방안
1. **네이버 API 직접 연동**: 네이버 로그인 API를 직접 호출
2. **커스텀 Provider 구현**: Supabase의 커스텀 provider 기능 활용
3. **서버사이드 처리**: Next.js API 라우트를 통한 OAuth 플로우 구현

### 필요한 설정
1. [NAVER Developers](https://developers.naver.com) 애플리케이션 등록
2. 네이버 로그인 API 사용 승인
3. Client ID, Client Secret 발급
4. 서비스 URL 등록

## 🐛 문제 해결

### 일반적인 문제들

1. **OAuth 리다이렉트 오류**
   - Redirect URI가 정확히 설정되어 있는지 확인
   - HTTP vs HTTPS 프로토콜 일치 여부 확인

2. **환경 변수 인식 안 됨**
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인
   - 개발 서버 재시작 (`npm run dev`)

3. **Google 로그인 실패**
   - Google Cloud Console에서 OAuth 2.0 동의 화면 설정 확인
   - 테스트 사용자 추가 (개발 중인 경우)

4. **Kakao 로그인 실패**
   - 카카오 로그인 활성화 상태 확인
   - 플랫폼 등록 (웹 플랫폼) 확인

## 📚 참고 문서

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Login API Documentation](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Naver Login API Documentation](https://developers.naver.com/docs/login/api/)

---

이 가이드를 참고하여 SNS 로그인 기능을 설정하시기 바랍니다. 추가 문의사항이 있으시면 개발팀에 문의해주세요.