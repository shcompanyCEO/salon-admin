#!/bin/bash

# Salon Admin 설치 스크립트 (Mac/Linux)

echo "🚀 Salon Admin 프로젝트 설치 시작..."
echo ""

# 현재 디렉토리 확인
echo "📂 현재 위치: $(pwd)"
echo ""

# Node.js 확인
echo "🔍 Node.js 버전 확인..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js $NODE_VERSION 설치됨"
else
    echo "❌ Node.js가 설치되어 있지 않습니다!"
    echo "   https://nodejs.org 에서 다운로드하세요."
    exit 1
fi
echo ""

# npm 확인
echo "🔍 npm 버전 확인..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm $NPM_VERSION 설치됨"
else
    echo "❌ npm이 설치되어 있지 않습니다!"
    exit 1
fi
echo ""

# 의존성 설치
echo "📦 의존성 설치 중... (2-3분 소요)"
npm install

if [ $? -eq 0 ]; then
    echo "✅ 의존성 설치 완료!"
else
    echo "❌ 의존성 설치 실패!"
    exit 1
fi
echo ""

# 환경 변수 파일 생성
echo "🔧 환경 변수 파일 생성..."
if [ -f .env.local ]; then
    echo "⚠️  .env.local 파일이 이미 존재합니다. 건너뜁니다."
else
    cp .env.example .env.local
    echo "✅ .env.local 파일 생성 완료!"
fi
echo ""

# 완료 메시지
echo "🎉 설치 완료!"
echo ""
echo "다음 명령어로 개발 서버를 실행하세요:"
echo "  npm run dev"
echo ""
echo "브라우저에서 http://localhost:3000 으로 접속하세요"
echo ""
echo "데모 로그인 정보:"
echo "  이메일: admin@salon.com"
echo "  비밀번호: password123"
echo ""
echo "Happy Coding! 💻✨"
