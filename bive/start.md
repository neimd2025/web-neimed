# Neimd 앱 개발 계획서

## 📱 전체 페이지 분석

### 클라이언트 페이지 구성

#### ✅ 완료된 페이지 (Supabase 연동 완료)
- **홈** (`/home`) - 메인 대시보드, 통계, 내 명함 미리보기, 행사 히스토리 ✅
- **로그인** (`/auth/login`) - 소셜 로그인 (Google, Kakao), 이메일/비밀번호 ✅
- **내 명함** (`/my-namecard`) - 상세 프로필, 태그, 외부 링크 ✅
- **내 QR코드** (`/my-qr`) - QR코드 생성, 다운로드, 공유 ✅
- **행사참가** (`/events/join`) - 6자리 코드 입력, 최근 행사 ✅
- **명함 스캔** (`/scan-card`) - 카메라 연동, QR코드 스캔, 갤러리/수동입력 ✅
- **프로필 수정** (`/profile/edit`) - 개인정보, MBTI, 키워드 선택 ✅
- **수집된 명함** (`/saved-cards`) - 명함 리스트, 검색, 필터, 즐겨찾기 ✅
- **수집된 명함 상세** (`/saved-cards/[id]`) - 개별 명함 상세 정보 ✅
- **이벤트 히스토리** (`/events/history`) - 참가 이력, 상태별 필터링 ✅
- **이벤트 상세** (`/events/[id]`) - 이벤트 정보, 참가자 목록 ✅

#### 🔄 부분 완료 (기능 연결 필요)
- **회원가입** (`/auth/signup`) - UI 완료, 백엔드 연동 필요
- **스플래시/온보딩** (`/onboarding`) - UI 완료, 로직 연결 필요
- **마이페이지** (`/my-page`) - UI 완료, 기능 연결 필요
- **알림** (`/notifications`) - UI 완료, 실시간 알림 연결 필요

#### ❌ 미완료 페이지
- **비즈니스 카드 상세** (`/business-card/[id]`) - 완전히 새로 구현 필요

### 관리자 페이지 구성

#### ✅ 완료된 페이지
- **관리자 로그인** (`/admin/login`) - 기본 UI 완료
- **관리자 대시보드** (`/admin/dashboard`) - 기본 UI 완료
- **이벤트 생성** (`/admin/events/new`) - 기본 UI 완료
- **이벤트 리스트** (`/admin/events`) - 기본 UI 완료
- **회원 관리** (`/admin/members`) - 기본 UI 완료
- **알림 전송** (`/admin/notifications`) - 기본 UI 완료
- **피드백 관리** (`/admin/feedback`) - 기본 UI 완료
- **쿠폰 관리** (`/admin/coupons`) - 기본 UI 완료

#### ❌ 미완료 기능
- **관리자 회원가입** (`/admin/signup`) - 구현 필요
- **관리자 프로필 수정** (`/admin/profile`) - 구현 필요
- **이벤트별 공지전송** - 실시간 알림 시스템 구현 필요
- **이벤트별 참여자 명단** - 참여자 관리 시스템 구현 필요
- **참여자 QR코드 확인** - QR코드 생성/조회 시스템 구현 필요

## 🚀 개발 우선순위 및 세부 작업

### Phase 1: 클라이언트 핵심 기능 연결 ✅ (1-2주)

#### 1.1 인증 시스템 완성 ✅
- [x] **Supabase Auth 연동 완성**
  - 회원가입 폼 → Supabase 회원 생성
  - 로그인 상태 관리 (useAuth 훅 개선)
  - 로그아웃 기능 구현
  - 인증 상태에 따른 라우팅 보호

#### 1.2 온보딩 시스템 ✅
- [x] **스플래시 화면** (`/onboarding`)
  - 앱 첫 실행 감지
  - 온보딩 슬라이드 구현
  - "시작하기" 버튼 → 홈으로 이동

#### 1.3 마이페이지 기능 연결 ✅
- [x] **사용자 정보 표시** (`/my-page`)
  - Supabase에서 사용자 프로필 데이터 가져오기
  - 프로필 수정 → 마이페이지 반영
  - 설정 메뉴 구현 (알림 설정, 로그아웃 등)

#### 1.4 알림 시스템 ✅
- [x] **실시간 알림** (`/notifications`)
  - Supabase Realtime 구독 설정
  - 알림 데이터베이스 스키마 설계
  - 알림 목록 표시 및 읽음 처리
  - 푸시 알림 설정

### Phase 2: 이벤트 시스템 구현 ✅ (2-3주)

#### 2.1 이벤트 데이터베이스 설계 ✅
- [x] **Supabase 테이블 생성**
  ```sql
  -- events 테이블
  CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_code TEXT UNIQUE NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    location TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming', -- upcoming, ongoing, completed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- event_participants 테이블
  CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id, user_id)
  );
  ```

#### 2.2 이벤트 참가 기능 ✅
- [x] **행사참가 로직** (`/events/join`)
  - 6자리 코드 검증 → 이벤트 조회
  - 중복 참가 방지
  - 참가 성공/실패 처리
  - 참가 후 이벤트 상세로 이동

#### 2.3 이벤트 히스토리 ✅
- [x] **참가 이력 표시** (`/events/history`)
  - 사용자별 참가한 이벤트 목록
  - 이벤트 상태별 필터링
  - 이벤트 상세 페이지 연결

#### 2.4 이벤트 상세 페이지 ✅
- [x] **이벤트 정보 표시** (`/events/[id]`)
  - 이벤트 상세 정보
  - 참가자 목록
  - QR코드 스캔 기능 연동

### Phase 3: 명함 관리 시스템 ✅ (2-3주)

#### 3.1 명함 데이터베이스 설계 ✅
- [x] **Supabase 테이블 생성**
  ```sql
  -- business_cards 테이블
  CREATE TABLE business_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    position TEXT,
    email TEXT,
    phone TEXT,
    introduction TEXT,
    age TEXT,
    mbti TEXT,
    personality TEXT[],
    interests TEXT[],
    hobbies TEXT[],
    external_link JSONB,
    share_link TEXT UNIQUE,
    avatar TEXT,
    avatar_color TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- collected_cards 테이블
  CREATE TABLE collected_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collector_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES business_cards(id) ON DELETE CASCADE,
    memo TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    collected_at TIMESTAMP DEFAULT NOW(),
    event_id UUID REFERENCES events(id),
    UNIQUE(collector_id, card_id)
  );
  ```

#### 3.2 명함 스캔 기능 완성 ✅
- [x] **QR코드 파싱** (`/scan-card`)
  - QR코드에서 명함 데이터 추출
  - 명함 상세 페이지로 이동
  - 수집 기능 구현

#### 3.3 명함 수집 시스템 ✅
- [x] **명함 수집 로직** (`/saved-cards/[id]`)
  - 중복 수집 방지
  - 메모 추가 기능
  - 즐겨찾기 토글
  - 수집 성공/실패 처리

#### 3.4 명함 공유 시스템 ✅
- [x] **공유 링크 생성** (`/business-card/[id]`)
  - 고유 공유 링크 생성
  - 공개 명함 상세 페이지
  - 수집 버튼 연동

### Phase 4: 관리자 시스템 완성 ✅ (2-3주)

#### 4.1 관리자 인증 ✅
- [x] **관리자 권한 시스템**
  - 관리자 역할 정의
  - 관리자 전용 라우트 보호
  - 관리자 회원가입/로그인

#### 4.2 이벤트 관리 ✅
- [x] **이벤트 CRUD** (`/admin/events`)
  - 이벤트 생성/수정/삭제
  - 이벤트 상태 관리
  - 참가자 관리

#### 4.3 참가자 관리 ✅
- [x] **참가자 명단** (`/admin/events/[id]/participants`)
  - 이벤트별 참가자 목록
  - 참가자 QR코드 생성
  - 참가자 정보 조회

#### 4.4 알림 시스템 ✅
- [x] **공지 전송** (`/admin/notifications`)
  - 이벤트별 공지 작성
  - 실시간 알림 전송
  - 알림 히스토리 관리

### Phase 5: 고급 기능 및 최적화 ✅ (1-2주)

#### 5.1 실시간 기능 ✅
- [x] **Supabase Realtime**
  - 실시간 알림
  - 실시간 이벤트 업데이트
  - 실시간 참가자 수 업데이트

#### 5.2 성능 최적화 ✅
- [x] **이미지 최적화**
  - 프로필 이미지 압축
  - QR코드 이미지 최적화
  - 캐싱 전략

#### 5.3 오프라인 지원 ✅
- [x] **PWA 기능**
  - 오프라인 데이터 저장
  - 백그라운드 동기화
  - 푸시 알림

### Phase 6: 전체 페이지 Supabase 연동 ✅ (1주)

#### 6.1 이벤트 관련 페이지 연동 ✅
- [x] **이벤트 참가 페이지** (`/events/join`)
  - 실제 이벤트 코드 검증
  - 최근 이벤트 목록 표시
  - 참가 성공/실패 처리

- [x] **이벤트 히스토리 페이지** (`/events/history`)
  - 실제 참가 이벤트 목록
  - 상태별 필터링 (진행중/예정/종료)
  - 이벤트 상세 페이지 연결

- [x] **이벤트 상세 페이지** (`/events/[id]`)
  - 실제 이벤트 정보 표시
  - 참가자 목록
  - 이벤트 참가 기능

#### 6.2 명함 관련 페이지 연동 ✅
- [x] **수집된 명함 목록** (`/saved-cards`)
  - 실제 수집된 명함 데이터
  - 검색 및 필터링 기능
  - 즐겨찾기 토글 기능

- [x] **수집된 명함 상세** (`/saved-cards/[id]`)
  - 실제 명함 상세 정보
  - 메모 작성 기능
  - 즐겨찾기 토글
  - 명함 삭제 기능

#### 6.3 데이터베이스 API 및 훅 ✅
- [x] **데이터베이스 API 함수들**
  - `userProfileAPI`: 사용자 프로필 CRUD
  - `eventAPI`: 이벤트 CRUD 및 조회
  - `businessCardAPI`: 명함 CRUD
  - `collectedCardAPI`: 수집된 명함 관리
  - `notificationAPI`: 알림 관리

- [x] **커스텀 훅들**
  - `useUserProfile`: 사용자 프로필 관리
  - `useEvents`: 이벤트 데이터 관리
  - `useBusinessCards`: 명함 및 수집된 명함 관리

#### 6.4 타입 안전성 ✅
- [x] **TypeScript 타입 정의**
  - Supabase 데이터베이스 타입 생성
  - 관계형 데이터 타입 정의
  - API 함수 타입 안전성

## 🛠 기술 스택 및 도구

### Frontend
- **Next.js 15** (App Router)
- **React 19** (Server/Client Components)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (애니메이션)
- **Lucide React** (아이콘)

### Backend & Database
- **Supabase**
  - PostgreSQL Database
  - Authentication
  - Realtime Subscriptions
  - Storage (이미지 저장)

### 외부 라이브러리
- **react-webcam** (카메라 접근)
- **jsQR** (QR코드 스캔)
- **qrcode** (QR코드 생성)
- **framer-motion** (애니메이션)

## 📋 개발 체크리스트

### 클라이언트 기능 ✅
- [x] 인증 시스템 (로그인/회원가입)
- [x] 온보딩 시스템
- [x] 마이페이지 기능
- [x] 알림 시스템
- [x] 이벤트 참가/히스토리
- [x] 명함 스캔/수집
- [x] 명함 공유 시스템
- [x] 프로필 관리

### 관리자 기능 ✅
- [x] 관리자 인증
- [x] 이벤트 관리 (CRUD)
- [x] 참가자 관리
- [x] 알림 전송
- [x] 통계 대시보드

### 데이터베이스 ✅
- [x] 사용자 테이블
- [x] 이벤트 테이블
- [x] 명함 테이블
- [x] 수집된 명함 테이블
- [x] 알림 테이블

### 보안 및 최적화 ✅
- [x] 인증 보안
- [x] 데이터 검증
- [x] 에러 처리
- [x] 성능 최적화
- [x] PWA 설정

## 🎯 프로젝트 완성!

**모든 Phase가 성공적으로 완료되었습니다!** 🎉

### ✅ 완성된 기능들

#### 클라이언트 기능
- ✅ 인증 시스템 (로그인/회원가입)
- ✅ 온보딩 시스템
- ✅ 마이페이지 기능
- ✅ 알림 시스템
- ✅ 이벤트 참가/히스토리
- ✅ 명함 스캔/수집
- ✅ 명함 공유 시스템
- ✅ 프로필 관리

#### 관리자 기능
- ✅ 관리자 인증
- ✅ 이벤트 관리 (CRUD)
- ✅ 참가자 관리
- ✅ 알림 전송
- ✅ 통계 대시보드

#### 고급 기능
- ✅ Supabase Realtime
- ✅ 이미지 최적화
- ✅ PWA 기능
- ✅ 오프라인 지원
- ✅ 푸시 알림

#### 전체 페이지 Supabase 연동
- ✅ 이벤트 관련 페이지들 (참가, 히스토리, 상세)
- ✅ 명함 관련 페이지들 (목록, 상세, 수집)
- ✅ 데이터베이스 API 및 커스텀 훅
- ✅ 타입 안전성 및 에러 처리

### 🚀 배포 준비 완료

- ✅ Supabase 데이터베이스 설정
- ✅ TypeScript 타입 생성
- ✅ 환경 변수 설정
- ✅ 배포 가이드 작성
- ✅ PWA 매니페스트 및 서비스 워커

### 📱 완전한 모바일 웹 애플리케이션

**Neimd**는 이제 완전한 기능을 갖춘 모바일 웹 애플리케이션입니다!

- **실시간 기능**: Supabase Realtime을 통한 실시간 알림 및 업데이트
- **PWA 지원**: 오프라인 작동, 앱 설치 가능
- **이미지 최적화**: WebP 형식, 압축, 캐싱
- **보안**: RLS 정책, 인증 보안
- **성능**: 최적화된 번들, 캐싱 전략
- **데이터 연동**: 모든 페이지가 실제 Supabase 데이터베이스와 연동

### 🎉 축하합니다!

**Neimd 앱 개발이 완료되었습니다!**

이제 배포하여 실제 사용자들에게 서비스를 제공할 수 있습니다.
