# Neimd 앱 배포 가이드

## 🚀 배포 준비

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kyibcvcwwvkldlasxyjn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWJjdmN3d3ZrbGRsYXN4eWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NTIxNjksImV4cCI6MjA2OTQyODE2OX0.LAmSL9sy3wr3ZzZ3wh3VZ6Xti5dCUjR4RLjxY68xseM

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Neimd
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

## 🌐 배포 옵션

### Vercel 배포 (권장)

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **프로젝트 배포**
   ```bash
   vercel
   ```

3. **환경 변수 설정**
   - Vercel 대시보드에서 프로젝트 설정
   - Environment Variables 섹션에서 `.env.local`의 모든 변수 추가

### Netlify 배포

1. **netlify.toml 생성**
   ```toml
   [build]
     command = "pnpm build"
     publish = ".next"

   [[headers]]
     for = "/manifest.json"
     [headers.values]
       Content-Type = "application/manifest+json"

   [[headers]]
     for = "/sw.js"
     [headers.values]
       Cache-Control = "public, max-age=0, must-revalidate"
   ```

2. **Netlify CLI로 배포**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   ```

### Docker 배포

1. **Dockerfile 생성**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   # Install dependencies based on the preferred package manager
   COPY package.json pnpm-lock.yaml* ./
   RUN npm install -g pnpm && pnpm install --frozen-lockfile

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   # Next.js collects completely anonymous telemetry data about general usage.
   # Learn more here: https://nextjs.org/telemetry
   # Uncomment the following line in case you want to disable telemetry during the build.
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN npm install -g pnpm && pnpm build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production
   # Uncomment the following line in case you want to disable telemetry during runtime.
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public

   # Set the correct permission for prerender cache
   RUN mkdir .next
   RUN chown nextjs:nodejs .next

   # Automatically leverage output traces to reduce image size
   # https://nextjs.org/docs/advanced-features/output-file-tracing
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000
   # set hostname to localhost
   ENV HOSTNAME "0.0.0.0"

   # server.js is created by next build from the standalone output
   # https://nextjs.org/docs/pages/api-reference/next-config-js/output
   CMD ["node", "server.js"]
   ```

2. **Docker 이미지 빌드 및 실행**
   ```bash
   docker build -t neimd-app .
   docker run -p 3000:3000 neimd-app
   ```

## 🔧 Supabase 설정

### 1. 인증 설정

Supabase 대시보드에서 다음 설정을 확인하세요:

- **Authentication > Settings > Site URL**: 배포된 도메인 URL
- **Authentication > Settings > Redirect URLs**:
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.com/auth/confirm`

### 2. OAuth 제공자 설정

#### Google OAuth
1. Google Cloud Console에서 OAuth 2.0 클라이언트 생성
2. Supabase 대시보드에서 Google 제공자 설정
3. Client ID와 Client Secret 입력

#### Kakao OAuth
1. Kakao Developers에서 애플리케이션 생성
2. Supabase 대시보드에서 Kakao 제공자 설정
3. Client ID와 Client Secret 입력

### 3. Storage 설정

Supabase Storage에서 다음 버킷을 생성하세요:

- `profile-images`: 프로필 이미지 저장
- `qr-codes`: QR 코드 이미지 저장
- `business-cards`: 명함 이미지 저장

### 4. RLS 정책 확인

모든 테이블에 대해 Row Level Security가 올바르게 설정되어 있는지 확인하세요.

## 📱 PWA 설정

### 1. 아이콘 생성

다음 크기의 아이콘을 생성하여 `public/icons/` 폴더에 저장하세요:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

### 2. 스크린샷 생성

`public/screenshots/` 폴더에 다음 스크린샷을 추가하세요:

- `home.png` (390x844)
- `my-namecard.png` (390x844)
- `scan-card.png` (390x844)

## 🔍 성능 최적화

### 1. 이미지 최적화

- WebP 형식 사용
- 적절한 이미지 크기 설정
- Lazy loading 구현

### 2. 번들 최적화

- Tree shaking 활성화
- 코드 스플리팅 활용
- 불필요한 의존성 제거

### 3. 캐싱 전략

- 정적 자산 캐싱
- API 응답 캐싱
- Service Worker 활용

## 🚨 보안 고려사항

### 1. 환경 변수 보안

- 민감한 정보는 환경 변수로 관리
- 프로덕션 환경에서 적절한 값 설정
- API 키 노출 방지

### 2. 인증 보안

- JWT 토큰 만료 시간 설정
- HTTPS 강제 사용
- CSRF 보호 구현

### 3. 데이터 보안

- RLS 정책 철저히 검토
- SQL 인젝션 방지
- XSS 공격 방지

## 📊 모니터링

### 1. 에러 추적

- Sentry 설정
- 로그 수집 및 분석
- 성능 모니터링

### 2. 사용자 분석

- Google Analytics 설정
- 사용자 행동 추적
- A/B 테스트 준비

## 🔄 CI/CD 파이프라인

### GitHub Actions 예시

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 지원

배포 중 문제가 발생하면 다음을 확인하세요:

1. 환경 변수 설정
2. Supabase 연결 상태
3. 빌드 로그 확인
4. 네트워크 연결 상태

---

**배포 완료 후 앱이 정상적으로 작동하는지 확인하고, 모든 기능을 테스트해보세요!** 🎉
