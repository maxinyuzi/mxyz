@echo off
REM 姓名：马昕玉子  学号：24002120214  时间：2026-11-20  大模型：GLM-5.3-Flash
REM 启动后端服务（Node.js + Express，端口 8214）

setlocal
REM 便携版 Node.js 路径（系统未安装 Node.js 时使用）
set MXYZ_NODE_DIR=C:\Users\31423\.local\share\node-v26.13.1-win-x64
set PATH=%MXYZ_NODE_DIR%;%PATH%

cd /d "%~dp0backend"
echo mxyz backend starting at http://localhost:8214 ...
node server.js
pause
