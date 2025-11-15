# 📥 Salon Admin - 다운로드 및 실행 가이드

## 🎯 VSCode에서 바로 실행할 수 있습니다!

이 프로젝트는 VSCode에서 바로 실행할 수 있도록 모든 설정이 완료되어 있습니다.

---

## 📦 다운로드

**salon-admin.zip** 파일을 다운로드하세요 (61KB)

---

## 🚀 빠른 시작 (3단계)

### 1️⃣ 압축 해제
```
원하는 위치에 salon-admin.zip 압축을 해제하세요
예: C:\Projects\salon-admin
```

### 2️⃣ VSCode로 열기
```
VSCode에서 File → Open Folder
salon-admin 폴더를 선택
```

### 3️⃣ 자동 설치 스크립트 실행

#### Windows (PowerShell)
```powershell
.\setup.ps1
```

#### Mac/Linux (Terminal)
```bash
chmod +x setup.sh
./setup.sh
```

#### 수동 설치 (선호하는 경우)
```bash
npm install
cp .env.example .env.local
npm run dev
```

---

## 🌐 실행 및 접속

서버가 시작되면 브라우저에서:
```
http://localhost:3000
```

### 🔐 데모 로그인
```
이메일: admin@salon.com
비밀번호: password123
```

---

## 📋 포함된 내용

### ✅ VSCode 설정 파일
- `.vscode/settings.json` - 자동 포맷팅 설정
- `.vscode/extensions.json` - 추천 확장 프로그램
- `.vscode/launch.json` - 디버그 설정

### ✅ 코드 품질 도구
- `.eslintrc.json` - ESLint 설정
- `.prettierrc` - Prettier 설정

### ✅ 자동 설치 스크립트
- `setup.ps1` - Windows PowerShell 스크립트
- `setup.sh` - Mac/Linux 배시 스크립트

### ✅ 상세 문서
- `README.md` - 프로젝트 개요
- `VSCODE_SETUP.md` - VSCode 상세 가이드
- `QUICKSTART.md` - 빠른 시작 가이드
- `ARCHITECTURE.md` - 아키텍처 문서
- `PROJECT_SUMMARY.md` - 프로젝트 요약

---

## 🔌 추천 VSCode 확장 프로그램

프로젝트를 열면 자동으로 설치 권장됩니다:

1. **ESLint** - 코드 품질 검사
2. **Prettier** - 코드 포맷팅
3. **Tailwind CSS IntelliSense** - CSS 자동완성
4. **TypeScript** - 타입 지원

---

## 💻 시스템 요구사항

### 필수
- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **VSCode**: 최신 버전 권장

### 권장 사양
- RAM: 4GB 이상
- 저장공간: 500MB 이상

---

## 📂 프로젝트 구조

```
salon-admin/
├── .vscode/              👈 VSCode 설정
├── src/
│   ├── app/             👈 페이지 (Next.js App Router)
│   ├── components/      👈 UI 컴포넌트
│   ├── store/           👈 Zustand 상태 관리
│   ├── lib/             👈 API & 유틸리티
│   ├── locales/         👈 다국어 (한/영/태)
│   └── types/           👈 TypeScript 타입
├── setup.ps1            👈 Windows 설치 스크립트
├── setup.sh             👈 Mac/Linux 설치 스크립트
└── [문서들]             👈 상세 가이드
```

---

## 🎨 주요 기능

### ✅ 완성된 페이지
- 🏠 **대시보드** - 실시간 통계
- 📅 **예약 관리** - 예약 CRUD
- 👥 **고객 관리** - 고객 정보 관리
- ✂️ **디자이너 관리** - 디자이너 프로필
- 🔐 **로그인** - JWT 인증

### ✅ 핵심 기능
- 🌍 다국어 지원 (한/영/태)
- 📱 반응형 디자인
- 🎨 Tailwind CSS
- 📊 Zustand 상태 관리
- 🔒 역할별 권한 관리

---

## 🐛 문제 해결

### Node.js가 없다는 오류
👉 https://nodejs.org 에서 설치

### 포트 3000이 사용 중
```bash
PORT=3001 npm run dev
```

### 모듈을 찾을 수 없음
```bash
rm -rf node_modules
npm install
```

### VSCode 확장 프로그램 안 보임
1. VSCode 재시작
2. View → Extensions (Ctrl+Shift+X)
3. 수동으로 설치

---

## 📚 더 알아보기

### 문서 우선순위
1. **VSCODE_SETUP.md** 👈 시작하세요!
2. **QUICKSTART.md** - 5분 안에 시작
3. **README.md** - 전체 개요
4. **ARCHITECTURE.md** - 아키텍처 상세

---

## 🎯 다음 단계

1. ✅ 프로젝트 다운로드 및 실행
2. 📖 코드 구조 파악
3. 🔧 기능 커스터마이징
4. 🚀 백엔드 API 연동
5. 🌐 배포

---

## ⭐ 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form
- **Icons**: Lucide React

---

## 💡 개발 팁

### VSCode에서 파일 빠르게 찾기
```
Ctrl+P 누르고 파일명 입력
```

### 코드 자동 포맷팅
```
파일 저장 시 자동으로 포맷팅됩니다
또는 Shift+Alt+F
```

### 터미널 열기
```
Ctrl+` (백틱)
```

### 디버깅 시작
```
F5 키 또는 Run → Start Debugging
```

---

## 🎉 준비 완료!

이제 개발을 시작할 준비가 되었습니다!

**질문이 있으시면 문서를 참고하거나 이슈를 등록해주세요.**

**Happy Coding! 💻✨**

---

## 📞 지원

- 📧 문의: 프로젝트 Issues
- 📖 문서: 프로젝트 내 마크다운 파일들
- 🌐 참고: Next.js, TypeScript, Tailwind 공식 문서
