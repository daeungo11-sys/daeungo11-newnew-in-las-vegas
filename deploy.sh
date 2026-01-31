#!/bin/bash
# 배포 스크립트 (Linux/Mac용)
# 실행: bash deploy.sh

echo "=== GitHub 및 Vercel 배포 스크립트 ==="

# Git 저장소 초기화 확인
if [ ! -d ".git" ]; then
    echo "Git 저장소 초기화 중..."
    git init
fi

# .env 파일이 스테이징되어 있는지 확인 및 제거
if git diff --cached --name-only | grep -q ".env"; then
    echo ".env 파일 제거 중..."
    git reset HEAD .env
fi

# 모든 파일 추가
echo "파일 추가 중..."
git add .

# 커밋
echo "커밋 중..."
git commit -m "Initial commit: Add Groq API integration"

# 브랜치 이름 변경
echo "브랜치 이름을 main으로 변경 중..."
git branch -M main

# 원격 저장소 확인 및 추가
if git remote get-url origin &>/dev/null; then
    echo "원격 저장소가 이미 설정되어 있습니다."
    read -p "원격 저장소를 업데이트하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin https://github.com/daeungo11-sys/Las-vegas-program-.git
    fi
else
    echo "원격 저장소 추가 중..."
    git remote add origin https://github.com/daeungo11-sys/Las-vegas-program-.git
fi

# 푸시
echo "GitHub에 푸시 중..."
echo "주의: GitHub 인증이 필요할 수 있습니다."
git push -u origin main

echo ""
echo "=== 배포 완료 ==="
echo "다음 단계:"
echo "1. https://vercel.com 에서 프로젝트를 가져오세요"
echo "2. Environment Variables에 VITE_GROQ_API_KEY를 추가하세요"
echo "3. 자세한 내용은 DEPLOY.md 파일을 참고하세요"
