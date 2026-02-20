@echo off
REM NebulaQQ 一键安装和启动脚本 (Windows)
REM 支持 x64、ARM64 Windows

REM 切换到脚本所在目录
cd /d "%~dp0"

setlocal enabledelayedexpansion

REM 颜色定义 (需要 Windows 10+)
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set "DEL=%%a"
  set "COLOR=%%b"
)

set "BLUE=[INFO]"
set "GREEN=[SUCCESS]"
set "YELLOW=[WARNING]"
set "RED=[ERROR]"

echo.
echo ========================================
echo   NebulaQQ 一键安装和启动脚本 (Windows)
echo ========================================
echo.

REM 检测 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED% 未检测到 Node.js，请先安装 Node.js ^>= 18.0.0
    echo %BLUE% 访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

for /f "tokens=2 delims=v." %%i in ('node -v') do set NODE_VERSION=%%i
if %NODE_VERSION% LSS 18 (
    echo %RED% Node.js 版本过低，需要 ^>= 18.0.0
    pause
    exit /b 1
)

echo %GREEN% Node.js 版本：
node -v
echo.

REM 检测 pnpm 和 npm
where pnpm >nul 2>nul
if %errorlevel% equ 0 (
    set "PM=pnpm"
    echo [INFO] 使用 pnpm 作为包管理器
    goto pm_found
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
    set "PM=npm"
    echo [WARNING] 未检测到 pnpm，使用 npm 作为包管理器
    echo [INFO] 安装 pnpm: npm install -g pnpm
    goto pm_found
)

echo [ERROR] 未检测到 npm 或 pnpm
pause
exit /b 1

:pm_found
echo.

REM 解析参数
set "ACTION=%~1"
if "%ACTION%"=="" set "ACTION=all"

if "%ACTION%"=="install" goto install
if "%ACTION%"=="build" goto build
if "%ACTION%"=="run" goto run
if "%ACTION%"=="all" goto all
if "%ACTION%"=="clean" goto clean
if "%ACTION%"=="help" goto help

echo %RED% 未知选项：%ACTION%
goto help

:help
echo ========================================
echo 用法：%~nx0 [选项]
echo.
echo 选项:
echo   install   仅安装依赖
echo   build     仅构建项目
echo   run       运行示例机器人
echo   all       安装 + 构建 + 运行 ^(默认^)
echo   clean     清理构建产物
echo   help      显示此帮助信息
echo.
echo 示例:
echo   %~nx0          完整流程
echo   %~nx0 install  仅安装依赖
echo   %~nx0 run      运行示例
echo.
pause
exit /b 0

:install
echo %BLUE% 开始安装依赖...
if exist "node_modules" (
    echo %YELLOW% 检测到旧的 node_modules
    set /p CLEAN="是否清理 node_modules? (y/N): "
    if /i "!CLEAN!"=="y" (
        rmdir /s /q node_modules 2>nul
        del /q package-lock.json 2>nul
        echo %BLUE% 已清理旧的依赖
    )
)

if "%PM%"=="pnpm" (
    call pnpm install --no-frozen-lockfile
) else (
    call npm install --legacy-peer-deps
)
if %errorlevel% neq 0 (
    echo %RED% 依赖安装失败
    pause
    exit /b 1
)

echo %GREEN% 依赖安装完成
goto end

:build
echo %BLUE% 开始构建项目...

if "%PM%"=="pnpm" (
    call pnpm run build
) else (
    call npm run build
)

echo %GREEN% 项目构建完成
goto end

:run
echo %BLUE% 准备运行示例...

cd examples\basic

echo %BLUE% 安装示例依赖...
if "%PM%"=="pnpm" (
    call pnpm install --no-frozen-lockfile
) else (
    call npm install --legacy-peer-deps
)

echo %GREEN% 启动 NebulaQQ 示例机器人...
echo %YELLOW% 请确保已配置好 OneBot 服务 ^(如 NapCatQQ^)
echo %BLUE% 默认配置：ws://127.0.0.1:3000
echo %BLUE% 按 Ctrl+C 停止机器人
echo.

node --loader ts-node/esm index.ts
goto end

:all
call :install
call :build
call :run
goto end

:clean
echo %BLUE% 清理构建产物...

for /d %%i in (packages\*\dist) do (
    if exist "%%i" (
        rmdir /s /q "%%i"
        echo %BLUE% 清理：%%i
    )
)

set /p CLEAN="是否清理 node_modules? (y/N): "
if /i "!CLEAN!"=="y" (
    rmdir /s /q node_modules 2>nul
    del /q package-lock.json 2>nul
    for /d %%i in (packages\*) do rmdir /s /q "%%i\node_modules" 2>nul
    for /d %%i in (examples\*) do rmdir /s /q "%%i\node_modules" 2>nul
    echo %GREEN% 已清理所有 node_modules
)

echo %GREEN% 清理完成
goto end

:end
echo.
endlocal
pause
