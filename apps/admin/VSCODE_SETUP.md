# 🚀 VSCode에서 프로젝트 실행하기

## 📦 1단계: 파일 다운로드 및 압축 해제

1. `salon-admin.zip` 파일을 다운로드합니다
2. 원하는 위치에 압축을 해제합니다
   ```
   예: C:\Projects\salon-admin 또는 ~/Projects/salon-admin
   ```

## 💻 2단계: VSCode로 프로젝트 열기

1. **VSCode 실행**
2. **File → Open Folder** (또는 `Ctrl+K Ctrl+O`)
3. 압축 해제한 `salon-admin` 폴더 선택

## 🔌 3단계: 필수 확장 프로그램 설치 (자동)

VSCode를 열면 우측 하단에 추천 확장 프로그램 설치 알림이 표시됩니다.
**"Install All"** 버튼을 클릭하세요.

### 수동 설치 (필요시)
1. **ESLint** (dbaeumer.vscode-eslint)
2. **Prettier** (esbenp.prettier-vscode)
3. **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
4. **TypeScript Vue Plugin** (ms-vscode.vscode-typescript-next)

## 📥 4단계: 의존성 설치

### VSCode 터미널 열기
- **메뉴**: Terminal → New Terminal
- **단축키**: `` Ctrl+` `` (백틱)

### 의존성 설치 명령어
```bash
npm install
```

⏳ 설치 시간: 약 2-3분

## 🔧 5단계: 환경 변수 설정

1. `.env.example` 파일을 복사하여 `.env.local` 생성
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env.local

   # Mac/Linux
   cp .env.example .env.local
   ```

2. `.env.local` 파일 내용 (필요시 수정)
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

## ▶️ 6단계: 개발 서버 실행

### 방법 1: VSCode 터미널에서 실행
```bash
npm run dev
```

### 방법 2: VSCode 디버거 사용 (F5)
1. **Run and Debug** 패널 열기 (Ctrl+Shift+D)
2. 드롭다운에서 **"Next.js: debug full stack"** 선택
3. **재생 버튼 (▶)** 클릭 또는 **F5** 키 누르기

## 🌐 7단계: 브라우저에서 확인

서버가 시작되면:
```
✓ Ready on http://localhost:3000
```

브라우저에서 http://localhost:3000 접속

## 🔐 8단계: 로그인

```
이메일: admin@salon.com
비밀번호: password123
```

---

## 🎯 빠른 실행 명령어

### 터미널에서 사용 가능한 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint

# 타입 체크
npx tsc --noEmit
```

---

## ⌨️ 유용한 VSCode 단축키

### 파일 탐색
- `Ctrl+P`: 파일 빠르게 열기
- `Ctrl+Shift+F`: 전체 검색
- `Ctrl+B`: 사이드바 토글

### 코드 편집
- `Alt+↑/↓`: 줄 이동
- `Shift+Alt+↑/↓`: 줄 복사
- `Ctrl+D`: 같은 단어 다중 선택
- `Ctrl+/`: 주석 토글

### 터미널
- `` Ctrl+` ``: 터미널 토글
- `Ctrl+Shift+5`: 터미널 분할

### 디버깅
- `F5`: 디버깅 시작
- `F9`: 중단점 설정/해제
- `F10`: 다음 줄로 이동
- `F11`: 함수 안으로 들어가기

---

## 🔍 프로젝트 구조 탐색

```
salon-admin/
├── src/
│   ├── app/              👈 페이지 파일들
│   │   ├── login/        👈 로그인 페이지
│   │   ├── dashboard/    👈 대시보드
│   │   ├── bookings/     👈 예약 관리
│   │   └── ...
│   ├── components/       👈 재사용 가능한 컴포넌트
│   │   ├── ui/          👈 공통 UI 컴포넌트
│   │   └── layout/      👈 레이아웃 컴포넌트
│   ├── store/           👈 Zustand 상태 관리
│   ├── lib/             👈 유틸리티 & API
│   ├── locales/         👈 다국어 번역
│   └── types/           👈 TypeScript 타입
└── public/              👈 정적 파일
```

---

## 🎨 개발 팁

### 1. 자동 저장 및 포맷팅
프로젝트는 이미 설정되어 있어, 파일 저장 시 자동으로 포맷팅됩니다.

### 2. Tailwind CSS 자동완성
CSS 클래스 작성 시 자동완성이 제공됩니다.
```tsx
<div className="bg-primary-600 text-white p-4 rounded-lg">
  // Tailwind IntelliSense가 자동완성 제공
</div>
```

### 3. TypeScript 타입 확인
변수 위에 마우스를 올리면 타입 정보를 확인할 수 있습니다.

### 4. 빠른 수정
에러나 경고가 있는 코드에 커서를 두고 `Ctrl+.` 를 누르면 빠른 수정 제안이 표시됩니다.

---

## 🐛 문제 해결

### 문제 1: "Cannot find module" 에러
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 문제 2: 포트 3000이 이미 사용 중
```bash
# 다른 포트로 실행
PORT=3001 npm run dev
```

### 문제 3: TypeScript 에러
```bash
# TypeScript 캐시 삭제
rm -rf .next
npm run dev
```

### 문제 4: ESLint/Prettier 작동 안 함
1. VSCode 재시작
2. 확장 프로그램 재설치
3. 설정 확인: `.vscode/settings.json`

---

## 📚 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs)
- [Zustand 문서](https://docs.pmnd.rs/zustand)

---

## ✨ 이제 개발을 시작하세요!

모든 설정이 완료되었습니다. 즐거운 코딩 되세요! 🎉

**질문이나 문제가 있으면 README.md와 QUICKSTART.md를 참고하세요.**
