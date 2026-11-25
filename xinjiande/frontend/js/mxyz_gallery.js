/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 图文列表页逻辑：请求 /api/mxyz_images 并渲染图文卡片
 */

(function () {
  const mxyzListEl = document.getElementById('mxyz_gallery_list');
  const mxyzTotalEl = document.getElementById('mxyz_total');

  function mxyzEscape(mxyzText) {
    const mxyzDiv = document.createElement('div');
    mxyzDiv.textContent = mxyzText;
    return mxyzDiv.innerHTML;
  }

  function mxyzRender(mxyzList) {
    if (!mxyzList.length) {
      mxyzListEl.innerHTML = '<p class="mxyz_empty">暂无图文数据</p>';
      return;
    }
    mxyzListEl.innerHTML = mxyzList.map(function (mxyzItem) {
      return '<article class="mxyz_gallery_item">'
        + '<img class="mxyz_gallery_img" src="' + mxyzEscape(mxyzItem.image_url) + '" alt="' + mxyzEscape(mxyzItem.title) + '" loading="lazy">'
        + '<div class="mxyz_gallery_info">'
        + '<h3 class="mxyz_gallery_title">' + mxyzEscape(mxyzItem.title) + '</h3>'
        + '<p class="mxyz_gallery_desc">' + mxyzEscape(mxyzItem.description || '') + '</p>'
        + '<div class="mxyz_gallery_meta">'
        + '<span class="mxyz_meta_category">分类：' + mxyzEscape(mxyzItem.category) + '</span>'
        + '<span>发布时间：' + mxyzEscape(mxyzItem.publish_time) + '</span>'
        + '<span># ' + mxyzItem.id + '</span>'
        + '</div>'
        + '</div>'
        + '</article>';
    }).join('');
  }

  async function mxyzLoadGallery() {
    try {
      const mxyzResp = await fetch('/api/mxyz_images');
      const mxyzData = await mxyzResp.json();
      console.log('mxyz 服务器返回数据:', mxyzData);

      if (mxyzData.code === 0) {
        mxyzTotalEl.textContent = mxyzData.data.total;
        mxyzRender(mxyzData.data.list);
      } else {
        mxyzListEl.innerHTML = '<p class="mxyz_empty">' + mxyzEscape(mxyzData.msg) + '</p>';
        console.error('mxyz 获取图文列表失败:', mxyzData.msg);
      }
    } catch (mxyzErr) {
      mxyzListEl.innerHTML = '<p class="mxyz_empty">请求服务器失败：' + mxyzEscape(mxyzErr.message) + '</p>';
      console.error('mxyz 请求异常:', mxyzErr);
    }
  }

  mxyzLoadGallery();
  console.log('mxyz 图文列表页脚本已加载');
})();
