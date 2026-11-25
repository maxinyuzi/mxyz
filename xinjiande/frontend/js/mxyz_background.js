/**
 * 姓名：马昕玉子 | 学号：24002120214 | 时间：2026-11-20 | 大模型：GLM-5.3-Flash
 * 公共 canvas 背景动画：漂浮的音符与粒子光点（供多个页面复用）
 */

(function () {
  const mxyzCanvas = document.getElementById('mxyz_bg_canvas');
  if (!mxyzCanvas) {
    return;
  }
  const mxyzCtx = mxyzCanvas.getContext('2d');

  // 漂浮对象：音符 + 光点
  const mxyzFloaters = [];
  const mxyzNoteChars = ['♪', '♫', '♩', '♬'];

  function mxyzResize() {
    mxyzCanvas.width = window.innerWidth;
    mxyzCanvas.height = window.innerHeight;
  }

  function mxyzCreateFloater(mxyzInitY) {
    const mxyzIsNote = Math.random() < 0.4;
    return {
      isNote: mxyzIsNote,
      char: mxyzNoteChars[Math.floor(Math.random() * mxyzNoteChars.length)],
      x: Math.random() * mxyzCanvas.width,
      y: mxyzInitY ? Math.random() * mxyzCanvas.height : mxyzCanvas.height + 30,
      size: mxyzIsNote ? 16 + Math.random() * 22 : 1.5 + Math.random() * 3,
      speed: 0.4 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.4
    };
  }

  function mxyzInit() {
    mxyzResize();
    const mxyzCount = Math.min(70, Math.floor(mxyzCanvas.width / 18));
    for (let i = 0; i < mxyzCount; i++) {
      mxyzFloaters.push(mxyzCreateFloater(true));
    }
  }

  function mxyzDraw() {
    mxyzCtx.clearRect(0, 0, mxyzCanvas.width, mxyzCanvas.height);

    for (const mxyzF of mxyzFloaters) {
      mxyzF.y -= mxyzF.speed;
      mxyzF.phase += 0.02;
      mxyzF.x += mxyzF.drift + Math.sin(mxyzF.phase) * 0.4;

      if (mxyzF.y < -40) {
        // 从底部重新生成
        Object.assign(mxyzF, mxyzCreateFloater(false));
      }

      mxyzCtx.globalAlpha = mxyzF.alpha;

      if (mxyzF.isNote) {
        mxyzCtx.font = mxyzF.size + 'px serif';
        mxyzCtx.fillStyle = '#c9b6ff';
        mxyzCtx.fillText(mxyzF.char, mxyzF.x, mxyzF.y);
      } else {
        mxyzCtx.beginPath();
        mxyzCtx.arc(mxyzF.x, mxyzF.y, mxyzF.size, 0, Math.PI * 2);
        mxyzCtx.fillStyle = '#7ea8ff';
        mxyzCtx.fill();
      }
    }

    mxyzCtx.globalAlpha = 1;
    requestAnimationFrame(mxyzDraw);
  }

  window.addEventListener('resize', function () {
    mxyzResize();
  });

  mxyzInit();
  mxyzDraw();

  console.log('mxyz canvas 背景动画已启动');
})();
