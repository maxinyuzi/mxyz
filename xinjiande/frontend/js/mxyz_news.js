/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 科技新闻列表页逻辑：请求 /api/mxyz_tech_news 并渲染列表
 */

(function () {
  const mxyzListEl = document.getElementById('mxyz_news_list');
  const mxyzTotalEl = document.getElementById('mxyz_total');
  const mxyzLoadingEl = document.getElementById('mxyz_loading');

  function mxyzEscape(mxyzText) {
    const mxyzDiv = document.createElement('div');
    mxyzDiv.textContent = mxyzText;
    return mxyzDiv.innerHTML;
  }

  function mxyzRender(mxyzList) {
    if (!mxyzList.length) {
      mxyzListEl.innerHTML = '<p class="mxyz_empty">暂无新闻数据</p>';
      return;
    }
    mxyzListEl.innerHTML = mxyzList.map(function (mxyzItem) {
      return '<article class="mxyz_news_item">'
        + '<h3 class="mxyz_news_title">' + mxyzEscape(mxyzItem.title) + '</h3>'
        + '<p class="mxyz_news_summary">' + mxyzEscape(mxyzItem.summary || '') + '</p>'
        + '<div class="mxyz_news_meta">'
        + '<span class="mxyz_meta_source">来源：' + mxyzEscape(mxyzItem.source) + '</span>'
        + '<span>作者：' + mxyzEscape(mxyzItem.author) + '</span>'
        + '<span>发布时间：' + mxyzEscape(mxyzItem.publish_time) + '</span>'
        + '<span># ' + mxyzItem.id + '</span>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  async function mxyzLoadNews() {
    try {
      const mxyzResp = await fetch('/api/mxyz_tech_news');
      const mxyzData = await mxyzResp.json();
      console.log('mxyz 服务器返回数据:', mxyzData);

      if (mxyzData.code === 0) {
        mxyzTotalEl.textContent = mxyzData.data.total;
        mxyzRender(mxyzData.data.list);
      } else {
        mxyzListEl.innerHTML = '<p class="mxyz_empty">' + mxyzEscape(mxyzData.msg) + '</p>';
        console.error('mxyz 获取新闻列表失败:', mxyzData.msg);
      }
    } catch (mxyzErr) {
      mxyzListEl.innerHTML = '<p class="mxyz_empty">请求服务器失败：' + mxyzEscape(mxyzErr.message) + '</p>';
      console.error('mxyz 请求异常:', mxyzErr);
    }
  }

  mxyzLoadNews();
  console.log('mxyz 新闻列表页脚本已加载');
})();
