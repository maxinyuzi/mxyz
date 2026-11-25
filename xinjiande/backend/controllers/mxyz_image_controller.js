/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 图文列表控制器：图文数据查询（数据存储于 MySQL 表 mxyz_image_texts）
 */
const mxyzDb = require('../config/mxyz_db');

// GET /api/mxyz_images 图文列表
exports.mxyzList = async (mxyzReq, mxyzRes) => {
  try {
    const mxyzConn = await mxyzDb.mxyzCreateConnection();
    const [mxyzRows] = await mxyzConn.query(
      'SELECT id, title, description, image_url, category, publish_time, created_at FROM mxyz_image_texts ORDER BY publish_time DESC'
    );
    await mxyzConn.end();

    mxyzRes.json({
      code: 0,
      msg: '获取图文列表成功',
      data: {
        total: mxyzRows.length,
        list: mxyzRows
      }
    });
  } catch (mxyzErr) {
    mxyzRes.json({
      code: 1,
      msg: '获取图文列表失败：' + mxyzErr.message,
      data: null
    });
  }
};
