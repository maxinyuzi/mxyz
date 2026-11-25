# 悦听音乐（音乐播放器网站）

- 姓名：马昕玉子
- 学号：24002120214
- 项目类别：模仿（课程作业）

## 项目简介

模仿主流在线音乐播放网站的 Web 课程作业项目，包含音乐播放、歌单、搜索等功能的实现。

## 技术栈

- 前端：原生 HTML / CSS / JavaScript（无第三方库、框架、CDN）
- 后端：Node.js + Express（RESTful + MVC），接口前缀 `/api/`，端口 8214
- 数据库：MySQL（凭据配置于 `backend/.env`）

## 目录结构

```
frontend/   前端静态资源（css / js / fonts / images）
backend/    后端服务（routes / controllers）
```

## 运行方式

```bash
cd backend
npm i
npm start
```

启动后访问 http://localhost:8214 即可打开首页。
