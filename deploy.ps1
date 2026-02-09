# 배포 스크립트
# PowerShell에서 실행: .\deploy.ps1

Write-Host "=== GitHub 및 Vercel 배포 스크립트 ===" -ForegroundColor Green

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "현재 디렉토리: $currentDir" -ForegroundColor Yellow

# Git 저장소 초기화 확인
if (-not (Test-Path ".git")) {
    Write-Host "Git 저장소 초기화 중..." -ForegroundColor Yellow
    git init
}

# .env 파일이 스테이징되어 있는지 확인 및 제거
$stagedFiles = git diff --cached --name-only
if ($stagedFiles -contains ".env") {
    Write-Host ".env 파일 제거 중..." -ForegroundColor Yellow
    git reset HEAD .env
}

# 모든 파일 추가
Write-Host "파일 추가 중..." -ForegroundColor Yellow
git add .

# 커밋
Write-Host "커밋 중..." -ForegroundColor Yellow
git commit -m "Initial commit: Add Groq API integration"

# 브랜치 이름 변경
Write-Host "브랜치 이름을 main으로 변경 중..." -ForegroundColor Yellow
git branch -M main

# 원격 저장소 확인 및 추가
$remoteUrl = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "원격 저장소 추가 중..." -ForegroundColor Yellow
    git remote add origin https://github.com/daeungo11-sys/Las-vegas-program-.git
} else {
    Write-Host "원격 저장소가 이미 설정되어 있습니다: $remoteUrl" -ForegroundColor Yellow
    Write-Host "원격 저장소를 업데이트하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "Y" -or $response -eq "y") {
        git remote set-url origin https://github.com/daeungo11-sys/Las-vegas-program-.git
    }
}

# 푸시
Write-Host "GitHub에 푸시 중..." -ForegroundColor Yellow
Write-Host "주의: GitHub 인증이 필요할 수 있습니다." -ForegroundColor Red
git push -u origin main

Write-Host "`n=== 배포 완료 ===" -ForegroundColor Green
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "1. https://vercel.com 에서 프로젝트를 가져오세요" -ForegroundColor Cyan
Write-Host "2. Environment Variables에 VITE_GROQ_API_KEY를 추가하세요" -ForegroundColor Cyan
Write-Host "3. 자세한 내용은 DEPLOY.md 파일을 참고하세요" -ForegroundColor Cyan
