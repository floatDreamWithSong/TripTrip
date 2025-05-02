@echo off

REM 检查当前分支是否为main分支
for /f "delims=" %%b in ('git branch --show-current') do set current_branch=%%b

if "%current_branch%"=="main" (
    echo 错误：不能在main分支上直接提交，请创建feature或hotfix分支
    exit /b 1
)

REM 从main分支拉取最新代码
echo 正在从main分支拉取最新代码...
git fetch origin main

echo 正在将main分支合并到当前分支...
git merge origin/main --no-ff

if %errorlevel% neq 0 (
    echo 合并冲突，请手动解决冲突后重新运行此脚本
    exit /b 1
)

REM 获取提交信息
set /p commit_message=请输入提交信息(格式: [类型] 描述): 

REM 验证提交信息格式
echo %commit_message% | findstr /r "^\[[a-zA-Z]+\] .*$" >nul

if %errorlevel% neq 0 (
    echo 错误：提交信息格式不正确，请使用[类型] 描述的格式
    echo 例如: [feat] 添加登录功能 或 [fix] 修复登录页面错误
    exit /b 1
)

REM 添加所有更改并提交
echo 正在添加更改并提交...
git add .
git commit -m "%commit_message%"

if %errorlevel% neq 0 (
    echo 提交失败
    exit /b 1
)

REM 推送到远程仓库
echo 正在推送到远程仓库...
git push origin %current_branch%

if %errorlevel% neq 0 (
    echo 推送失败
    exit /b 1
)

echo 操作完成！请前往GitHub创建Pull Request将%current_branch%合并到main分支