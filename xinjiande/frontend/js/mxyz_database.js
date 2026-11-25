/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 数据库连接页逻辑：表单提交 -> /api/mxyz_database_connect，成功与错误均有提示
 */

(function () {
  const mxyzForm = document.getElementById('mxyz_connect_form');
  const mxyzBtn = document.getElementById('mxyz_submit_btn');
  const mxyzResult = document.getElementById('mxyz_result');
  const mxyzResultMsg = document.getElementById('mxyz_result_msg');
  const mxyzResultDetail = document.getElementById('mxyz_result_detail');

  function mxyzGetInputValue(mxyzId) {
    return document.getElementById(mxyzId).value.trim();
  }

  function mxyzShowResult(mxyzOk, mxyzMsg, mxyzDetail) {
    mxyzResult.hidden = false;
    mxyzResult.classList.remove('mxyz_success', 'mxyz_error');
    mxyzResult.classList.add(mxyzOk ? 'mxyz_success' : 'mxyz_error');
    mxyzResultMsg.textContent = (mxyzOk ? '✔ ' : '✘ ') + mxyzMsg;
    mxyzResultDetail.textContent = mxyzDetail || '';
  }

  mxyzForm.addEventListener('submit', async function (mxyzEvent) {
    mxyzEvent.preventDefault();

    const mxyzPayload = {
      mxyz_host: mxyzGetInputValue('mxyz_host'),
      mxyz_port: mxyzGetInputValue('mxyz_port'),
      mxyz_user: mxyzGetInputValue('mxyz_user'),
      mxyz_password: document.getElementById('mxyz_password').value,
      mxyz_database: mxyzGetInputValue('mxyz_database')
    };

    mxyzBtn.disabled = true;
    mxyzBtn.textContent = '连接中...';
    console.log('mxyz 正在连接数据库:', mxyzPayload.mxyz_host + ':' + mxyzPayload.mxyz_port, '用户:', mxyzPayload.mxyz_user);

    try {
      const mxyzResp = await fetch('/api/mxyz_database_connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mxyzPayload)
      });
      const mxyzData = await mxyzResp.json();

      console.log('mxyz 服务器返回数据:', mxyzData);

      if (mxyzData.code === 0) {
        const mxyzLines = [
          'MySQL 版本: ' + mxyzData.data.server_version,
          '主机: ' + mxyzData.data.host + ':' + mxyzPayload.mxyz_port,
          '用户: ' + mxyzData.data.user,
          '数据库: ' + mxyzData.data.database,
          '数据库列表: ' + mxyzData.data.databases.join(', ')
        ];
        mxyzShowResult(true, mxyzData.msg, mxyzLines.join('\n'));
      } else {
        mxyzShowResult(false, mxyzData.msg, '');
        console.error('mxyz 数据库连接失败:', mxyzData.msg);
      }
    } catch (mxyzErr) {
      mxyzShowResult(false, '请求服务器失败：' + mxyzErr.message, '');
      console.error('mxyz 请求异常:', mxyzErr);
    } finally {
      mxyzBtn.disabled = false;
      mxyzBtn.textContent = '连接数据库';
    }
  });

  console.log('mxyz 数据库连接页脚本已加载');
})();
