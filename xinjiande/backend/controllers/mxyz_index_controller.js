/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 通用控制器：健康检查等
 */

// GET /api/mxyz_health 健康检查
exports.mxyzHealth = (mxyzReq, mxyzRes) => {
  mxyzRes.json({
    code: 0,
    msg: '服务正常',
    data: {
      name: 'mxyz-music-player',
      time: new Date().toISOString()
    }
  });
};
