# Salon Admin 설치 스크립트 (Windows PowerShell)

Write-Host "🚀 Salon Admin 프로젝트 설치 시작..." -ForegroundColor Green
Write-Host ""

# 현재 디렉토리 확인
$currentPath = Get-Location
Write-Host "📂 현재 위치: $currentPath" -ForegroundColor Cyan
Write-Host ""

# Node.js 확인
Write-Host "🔍 Node.js 버전 확인..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion 설치됨" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js가 설치되어 있지 않습니다!" -ForegroundColor Red
    Write-Host "   https://nodejs.org 에서 다운로드하세요." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# npm 확인
Write-Host "🔍 npm 버전 확인..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion 설치됨" -ForegroundColor Green
} catch {
    Write-Host "❌ npm이 설치되어 있지 않습니다!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 의존성 설치
Write-Host "📦 의존성 설치 중... (2-3분 소요)" -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 의존성 설치 완료!" -ForegroundColor Green
} else {
    Write-Host "❌ 의존성 설치 실패!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 환경 변수 파일 생성
Write-Host "🔧 환경 변수 파일 생성..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    Write-Host "⚠️  .env.local 파일이 이미 존재합니다. 건너뜁니다." -ForegroundColor Yellow
} else {
    Copy-Item .env.example .env.local
    Write-Host "✅ .env.local 파일 생성 완료!" -ForegroundColor Green
}
Write-Host ""

# 완료 메시지
Write-Host "🎉 설치 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 명령어로 개발 서버를 실행하세요:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "브라우저에서 http://localhost:3000 으로 접속하세요" -ForegroundColor Cyan
Write-Host ""
Write-Host "데모 로그인 정보:" -ForegroundColor Cyan
Write-Host "  이메일: admin@salon.com" -ForegroundColor White
Write-Host "  비밀번호: password123" -ForegroundColor White
Write-Host ""
Write-Host "Happy Coding! 💻✨" -ForegroundColor Magenta
