# Salon Admin - 살롱 예약 관리 시스템

헤어살롱을 위한 포괄적인 예약 및 관리 플랫폼의 관리자 웹사이트입니다.

## 🚀 기술 스택

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

## 📋 주요 기능

### 사용자 역할별 기능

#### 살롱 관리자 (SALON_MANAGER)
- ✅ 대시보드 - 실시간 통계 및 분석
- ✅ 예약 관리 - 온라인/전화/직접방문 예약 통합 관리
- ✅ 고객 관리 - 고객 정보 및 히스토리 관리
- ✅ 디자이너 관리 - 디자이너 등록 및 권한 설정
- ✅ 서비스 관리 - 제공 서비스 및 가격 관리
- ✅ 리뷰 관리 - 고객 리뷰 확인 및 응답
- ✅ 매출 관리 - 일/월별 매출 분석
- ✅ 채팅 - 고객 문의 응답
- ✅ 사용자 관리 - 직원 계정 관리

#### 디자이너 (DESIGNER)
- ✅ 개인 대시보드
- ✅ 예약 확인 및 관리
- ✅ 고객 정보 조회
- ✅ 리뷰 관리
- ✅ 개인 매출 확인
- ✅ 채팅

#### 슈퍼 관리자 (SUPER_ADMIN)
- ✅ 전체 살롱 관리
- ✅ 살롱 등록 승인
- ✅ 전체 시스템 모니터링
- ✅ 데이터 분석 및 통계

## 🌍 다국어 지원

- 한국어 (ko)
- English (en)
- ภาษาไทย (th)

## 📁 프로젝트 구조

```
salon-admin/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── login/             # 로그인 페이지
│   │   ├── dashboard/         # 대시보드
│   │   ├── bookings/          # 예약 관리
│   │   ├── customers/         # 고객 관리
│   │   ├── designers/         # 디자이너 관리
│   │   ├── services/          # 서비스 관리
│   │   ├── reviews/           # 리뷰 관리
│   │   ├── sales/             # 매출 관리
│   │   ├── chat/              # 채팅
│   │   └── settings/          # 설정
│   ├── components/            # 리액트 컴포넌트
│   │   ├── ui/               # 공통 UI 컴포넌트
│   │   └── layout/           # 레이아웃 컴포넌트
│   ├── store/                # Zustand 상태 관리
│   │   ├── authStore.ts      # 인증 상태
│   │   ├── salonStore.ts     # 살롱 상태
│   │   ├── bookingStore.ts   # 예약 상태
│   │   └── uiStore.ts        # UI 상태
│   ├── lib/                  # 유틸리티 함수
│   │   ├── api.ts           # API 클라이언트
│   │   └── utils.ts         # 헬퍼 함수
│   ├── locales/             # 다국어 번역
│   │   ├── ko.ts
│   │   ├── en.ts
│   │   ├── th.ts
│   │   └── useTranslation.ts
│   └── types/               # TypeScript 타입 정의
│       └── index.ts
├── public/                  # 정적 파일
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🛠️ 설치 및 실행

### 필수 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
# 또는
yarn install
```

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 프로덕션 빌드

```bash
npm run build
npm run start
# 또는
yarn build
yarn start
```

## 🔑 환경 변수

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📱 반응형 디자인

모든 페이지는 다음 화면 크기에 최적화되어 있습니다:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: 살롱 브랜드 컬러 (Red 계열)
- **Secondary**: 중립 컬러 (Gray 계열)
- **Success**: Green
- **Warning**: Yellow
- **Danger**: Red
- **Info**: Blue

### 타이포그래피

- **Font Family**: Inter (Google Fonts)
- **Font Sizes**: 
  - xs: 0.75rem
  - sm: 0.875rem
  - base: 1rem
  - lg: 1.125rem
  - xl: 1.25rem
  - 2xl: 1.5rem
  - 3xl: 1.875rem

## 🔐 인증 및 권한

- JWT 기반 인증
- Role-based access control (RBAC)
- Protected routes
- 권한별 메뉴 표시

## 📊 상태 관리

Zustand를 사용한 글로벌 상태 관리:

```typescript
// 인증 상태 사용 예시
const { user, login, logout } = useAuthStore();

// UI 상태 사용 예시
const { locale, setLocale, isSidebarOpen, toggleSidebar } = useUIStore();

// 예약 상태 사용 예시
const { bookings, addBooking, updateBooking } = useBookingStore();
```

## 🌐 API 연동

API 클라이언트는 `/src/lib/api.ts`에 구현되어 있습니다:

```typescript
import { authApi, salonApi, bookingApi } from '@/lib/api';

// 로그인
const response = await authApi.login(email, password);

// 예약 목록 조회
const bookings = await bookingApi.getBookings({ date: '2024-11-12' });

// 예약 생성
const newBooking = await bookingApi.createBooking(bookingData);
```

## 🧪 테스트

```bash
# 단위 테스트 실행 (설정 필요)
npm run test

# E2E 테스트 실행 (설정 필요)
npm run test:e2e
```

## 📝 코딩 컨벤션

- **Components**: PascalCase (예: `Button.tsx`)
- **Utilities**: camelCase (예: `formatDate`)
- **Constants**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (예: `User`, `Booking`)

## 🚧 개발 중인 기능

- [ ] 서비스 관리 페이지
- [ ] 리뷰 관리 페이지 (부분 완료)
- [ ] 매출 분석 페이지
- [ ] 채팅 기능
- [ ] 설정 페이지
- [ ] 슈퍼 관리자 전용 페이지
- [ ] 실시간 알림
- [ ] 이미지 업로드 및 관리
- [ ] PDF 리포트 생성
- [ ] 데이터 내보내기 (CSV, Excel)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**Note**: 이 프로젝트는 현재 개발 중이며, 백엔드 API와 연동하기 위해서는 별도의 API 서버가 필요합니다.
