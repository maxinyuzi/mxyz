/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * Express 应用配置：cors 跨域、托管前端静态资源、挂载 API 路由
 */
const mxyzExpress = require('express');
const mxyzCors = require('cors');
const mxyzPath = require('path');

const mxyzRouter = require('./routes/mxyz_router');

const mxyzApp = mxyzExpress();

// 开放全部跨域（仅用于课程作业）
mxyzApp.use(mxyzCors());

// 解析 JSON 请求体
mxyzApp.use(mxyzExpress.json());

// 托管 frontend/ 静态资源目录
mxyzApp.use(mxyzExpress.static(mxyzPath.join(__dirname, '..', 'frontend')));

// 统一挂载 /api/ 前缀路由
mxyzApp.use('/api', mxyzRouter);

module.exports = mxyzApp;
