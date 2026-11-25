/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 数据库配置模块：从 backend/.env 读取 DB_* 凭据，提供连接工厂方法
 */
require('dotenv').config();
const mxyzMysql = require('mysql2/promise');

// 创建数据库连接
exports.mxyzCreateConnection = function (mxyzOptions) {
  return mxyzMysql.createConnection(Object.assign({
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || undefined,
    charset: 'utf8mb4',
    connectTimeout: 5000
  }, mxyzOptions || {}));
};
