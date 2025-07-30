# 웹 네임드 프로젝트 - Claude AI 작업 지침서

## 📋 프로젝트 개요
웹 네임드는 이름의 의미를 발견하고 특별한 명함을 만들어 세상과 연결하는 Next.js 기반의 웹 애플리케이션입니다.

### 기술 스택
- **프레임워크**: Next.js 15.2.4
- **런타임**: React 19
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI + Shadcn/ui
- **상태관리**: zustand
- **폼 관리**: React Hook Form + Zod
- **아이콘**: Lucide React
- **차트**: Recharts
- **QR 코드**: qrcode 라이브러리

### 프로젝트 구조
```
app/
├── admin/          # 관리자 페이지
├── business-card/  # 명함 관련 페이지
├── events/         # 이벤트 페이지
├── home/           # 홈 페이지
├── login/          # 로그인
├── my-page/        # 마이페이지
├── profile/        # 프로필
└── signup/         # 회원가입

components/
├── admin/          # 관리자 전용 컴포넌트
├── ui/             # 공통 UI 컴포넌트 (Shadcn/ui)
├── bottom-navigation.tsx
├── header-navigation.tsx
└── mobile-*.tsx    # 모바일 전용 컴포넌트

stores/
├── auth-store.ts       # 인증 상태 스토어 (Zustand)
└── admin-store.ts      # 관리자 상태 스토어 (Zustand)

lib/
├── utils.ts        # 유틸리티 함수
└── workflow-generator/ # 워크플로우 생성기 시스템
```

## 🎯 핵심 기능
1. **사용자 인증**: 로그인/회원가입 시스템
2. **명함 생성**: 개인화된 디지털 명함 제작
3. **QR 코드**: 명함 공유를 위한 QR 코드 생성
4. **이벤트 관리**: 사용자 이벤트 참여 및 관리
5. **관리자 패널**: 전체 시스템 관리 인터페이스
6. **모바일 최적화**: 반응형 디자인 및 모바일 UX

## 🛠 개발 가이드라인

### 컴포넌트 개발 원칙
- **일관성**: 기존 디자인 시스템과 패턴을 따를 것
- **재사용성**: 공통 컴포넌트는 `components/ui/`에 배치
- **접근성**: WCAG 2.1 AA 기준 준수
- **성능**: 불필요한 리렌더링 방지 및 최적화
- **타입 안전성**: TypeScript 엄격 모드 활용

### 코딩 컨벤션
- **파일명**: kebab-case 사용 (예: `user-profile.tsx`)
- **컴포넌트명**: PascalCase 사용 (예: `UserProfile`)
- **함수명**: camelCase 사용 (예: `handleSubmit`)
- **상수명**: UPPER_SNAKE_CASE 사용 (예: `API_BASE_URL`)
- **CSS 클래스**: Tailwind 유틸리티 우선 사용

### 상태 관리 패턴
- **전역 상태**: Zustand 사용 (`auth-store`, `admin-store`)
- **영속성**: Zustand persist 미들웨어로 localStorage 자동 관리
- **서버 상태**: 필요시 React Query 도입 고려
- **폼 상태**: React Hook Form + Zod validation
- **로컬 상태**: useState, useReducer 적절히 활용

#### Zustand 사용 예시
```typescript
// Store 사용
const { user, login, logout } = useAuthStore()

// 상태 업데이트
const handleLogin = async () => {
  const success = await login(email, password)
  if (success) router.push('/home')
}

// 상태 구독 (컴포넌트가 자동 리렌더링)
const user = useAuthStore(state => state.user)
```

## 📱 모바일 우선 개발

### 반응형 설계
- **모바일 퍼스트**: 320px부터 시작
- **브레이크포인트**: Tailwind 기본값 활용
  - `sm`: 640px+
  - `md`: 768px+
  - `lg`: 1024px+
  - `xl`: 1280px+

### 모바일 UX 고려사항
- **터치 인터랙션**: 최소 44px 터치 영역 확보
- **네비게이션**: 하단 네비게이션 바 (`MobileBottomNav`)
- **헤더**: 모바일 최적화 헤더 (`MobileHeader`)
- **성능**: 이미지 최적화 및 lazy loading

## 🔒 보안 및 인증

### 인증 시스템
- **Zustand Store**: `useAuthStore`로 전역 인증 상태 관리
- **자동 영속성**: localStorage에 사용자 정보 자동 저장/복원
- **세션 관리**: 로그인 상태 유지 및 자동 로그아웃
- **권한 관리**: 사용자/관리자 역할 기반 접근 제어

### 보안 고려사항
- **입력 검증**: Zod 스키마로 클라이언트 측 검증
- **XSS 방지**: React의 기본 이스케이핑 활용
- **CSRF 방지**: 필요시 토큰 기반 보호
- **민감정보**: 환경변수로 관리

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#7C38ED` (보라색)
- **Background**: `#FFFFFF` (흰색)
- **Secondary**: `#F3F4F6` (회색)
- **Text**: Tailwind 기본 회색 팔레트

### 컴포넌트 라이브러리
- **Radix UI**: 접근성이 보장된 headless 컴포넌트
- **Shadcn/ui**: 스타일링된 컴포넌트 세트
- **Lucide**: 일관된 아이콘 세트

### 타이포그래피
- **Primary Font**: Inter (Google Fonts)
- **계층구조**: Tailwind 텍스트 유틸리티 활용

## 🚀 배포 및 성능

### 빌드 최적화
- **Next.js 최적화**: 자동 코드 분할 및 이미지 최적화
- **번들 분석**: `@next/bundle-analyzer` 활용
- **Tree Shaking**: 사용하지 않는 코드 제거

### 성능 목표
- **LCP**: < 2.5초
- **FID**: < 100ms
- **CLS**: < 0.1
- **번들 크기**: 초기 로드 < 500KB

## 📝 개발 워크플로우

### Git 워크플로우
- **브랜치 전략**: Feature branch workflow
- **커밋 메시지**: Conventional Commits 형식
- **PR 리뷰**: 코드 품질 및 테스트 확인

### 테스트 전략
- **Unit Tests**: Jest + Testing Library
- **Integration Tests**: 주요 사용자 플로우
- **E2E Tests**: Playwright (필요시)

### 코드 품질
- **ESLint**: Next.js 기본 설정 + 커스텀 규칙
- **Prettier**: 코드 포맷팅 자동화
- **TypeScript**: 엄격 모드 활성화
- **Husky**: pre-commit 훅 설정

## 🔧 유틸리티 및 헬퍼

### 공통 유틸리티 (`lib/utils.ts`)
- **cn**: clsx + tailwind-merge로 클래스명 결합
- **날짜 처리**: date-fns 활용
- **폼 검증**: Zod 스키마 정의

### 커스텀 훅 (`hooks/`)
- **useToast**: 토스트 알림 관리
- **useMobile**: 모바일 디바이스 감지

## 📚 추가 리소스

### 문서 참조
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/primitives)
- [Zustand 문서](https://zustand-demo.pmnd.rs/)

### 개발 도구
- **VS Code 확장**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer

## 🤖 AI 어시스턴트 활용 가이드

### Claude Code 활용
- **코드 리뷰**: 품질 및 성능 개선 제안
- **버그 수정**: 체계적인 디버깅 지원
- **기능 구현**: 단계별 개발 가이드
- **리팩토링**: 코드 구조 개선 제안

### 작업 요청시 포함할 정보
1. **목적**: 구현하려는 기능 또는 해결하려는 문제
2. **컨텍스트**: 관련 파일 경로 및 기존 코드
3. **요구사항**: 구체적인 기능 명세 또는 제약사항
4. **기대 결과**: 원하는 최종 결과물

### 예시 요청
```
사용자 프로필 수정 기능을 구현해주세요.

목적: 마이페이지에서 사용자가 자신의 프로필 정보를 수정할 수 있는 기능
컨텍스트: app/profile/edit/page.tsx, stores/auth-store.ts
요구사항:
- 이름, 이메일, 전화번호 수정 가능
- React Hook Form + Zod 검증
- 저장 후 토스트 알림
기대 결과: 완전히 동작하는 프로필 수정 폼 컴포넌트
```

## 📋 체크리스트

### 새 기능 개발시
- [ ] TypeScript 타입 정의 완료
- [ ] 반응형 디자인 구현
- [ ] 접근성 고려사항 적용
- [ ] 에러 처리 및 로딩 상태
- [ ] 기존 디자인 시스템 준수
- [ ] 성능 최적화 적용
- [ ] 테스트 코드 작성 (필요시)

### 코드 리뷰시
- [ ] 코딩 컨벤션 준수
- [ ] 불필요한 리렌더링 없음
- [ ] 적절한 키 prop 사용
- [ ] 메모리 누수 가능성 검토
- [ ] 보안 취약점 검토
- [ ] 성능 영향 평가

## 🔄 업데이트 로그

### 최근 변경사항
- Next.js 15.2.4로 업그레이드
- React 19 도입
- **상태 관리 마이그레이션**: React Context → Zustand로 전환
- SuperClaude Workflow Generator 시스템 추가
- 종합적인 워크플로우 생성 및 관리 기능 구현

### 향후 계획
- 실시간 알림 시스템 구현
- PWA 기능 추가
- 다국어 지원 확장
- 성능 모니터링 시스템 도입

---

이 문서는 웹 네임드 프로젝트의 개발을 위한 종합적인 가이드입니다. 프로젝트의 발전에 따라 지속적으로 업데이트됩니다.
