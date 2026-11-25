/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 后端入口：启动 HTTP 服务，监听 8214 端口
 */
const mxyzApp = require('./app');

const mxyzPort = 8214;

mxyzApp.listen(mxyzPort, () => {
  console.log(`mxyz server is running at http://localhost:${mxyzPort}`);
});
