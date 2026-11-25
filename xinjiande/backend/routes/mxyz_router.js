/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * API 路由：所有接口以 /api/ 为前缀，按模块拆分
 */
const mxyzExpress = require('express');

const mxyzIndexController = require('../controllers/mxyz_index_controller');
const mxyzDatabaseController = require('../controllers/mxyz_database_controller');
const mxyzNewsController = require('../controllers/mxyz_news_controller');
const mxyzImageController = require('../controllers/mxyz_image_controller');

const mxyzRouter = mxyzExpress.Router();

// 健康检查
mxyzRouter.get('/mxyz_health', mxyzIndexController.mxyzHealth);

// 数据库连接测试
mxyzRouter.post('/mxyz_database_connect', mxyzDatabaseController.mxyzConnect);

// 科技新闻列表
mxyzRouter.get('/mxyz_tech_news', mxyzNewsController.mxyzList);

// 图文列表
mxyzRouter.get('/mxyz_images', mxyzImageController.mxyzList);

module.exports = mxyzRouter;
