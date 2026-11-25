/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 科技新闻控制器：新闻列表查询（数据存储于 MySQL 表 mxyz_tech_news）
 */
const mxyzDb = require('../config/mxyz_db');

// GET /api/mxyz_tech_news 科技新闻列表
exports.mxyzList = async (mxyzReq, mxyzRes) => {
  try {
    const mxyzConn = await mxyzDb.mxyzCreateConnection();
    const [mxyzRows] = await mxyzConn.query(
      'SELECT id, title, summary, source, author, publish_time, created_at FROM mxyz_tech_news ORDER BY publish_time DESC'
    );
    await mxyzConn.end();

    mxyzRes.json({
      code: 0,
      msg: '获取新闻列表成功',
      data: {
        total: mxyzRows.length,
        list: mxyzRows
      }
    });
  } catch (mxyzErr) {
    mxyzRes.json({
      code: 1,
      msg: '获取新闻列表失败：' + mxyzErr.message,
      data: null
    });
  }
};
