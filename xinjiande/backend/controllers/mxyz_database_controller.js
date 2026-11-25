/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 数据库控制器：连接 MySQL 数据库测试
 */
const mxyzMysql = require('mysql2/promise');

// POST /api/mxyz_database_connect 测试连接 MySQL
exports.mxyzConnect = async (mxyzReq, mxyzRes) => {
  const mxyzBody = mxyzReq.body || {};
  const mxyzUser = mxyzBody.mxyz_user;
  const mxyzPassword = mxyzBody.mxyz_password;
  const mxyzHost = mxyzBody.mxyz_host || 'localhost';
  const mxyzDatabase = mxyzBody.mxyz_database || '';

  // 参数校验：系统边界处验证用户输入
  if (!mxyzUser || mxyzPassword === undefined || mxyzPassword === null) {
    return mxyzRes.json({
      code: 1,
      msg: '连接失败：用户名和密码不能为空',
      data: null
    });
  }

  try {
    const mxyzConn = await mxyzMysql.createConnection({
      host: mxyzHost,
      port: mxyzBody.mxyz_port ? Number(mxyzBody.mxyz_port) : 3306,
      user: mxyzUser,
      password: mxyzPassword,
      database: mxyzDatabase || undefined,
      connectTimeout: 5000
    });

    const [mxyzVerRows] = await mxyzConn.query('SELECT VERSION() AS version');
    const [mxyzDbRows] = await mxyzConn.query('SHOW DATABASES');
    await mxyzConn.end();

    mxyzRes.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        host: mxyzHost,
        user: mxyzUser,
        database: mxyzDatabase || '(未指定数据库)',
        server_version: mxyzVerRows[0].version,
        databases: mxyzDbRows.map(mxyzRow => mxyzRow.Database)
      }
    });
  } catch (mxyzErr) {
    mxyzRes.json({
      code: 2,
      msg: '数据库连接失败：' + mxyzErr.message,
      data: null
    });
  }
};
