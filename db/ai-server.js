/**
 * 作者：马昕玉子
 * 建立时间：2026-11-25
 * 使用大模型：GLM-5.3-Flash
 * 功能名称：AI 对话数据服务器（多平台代理：硅基流动 / 七牛，端口 3005）
 *
 * 说明：本文件为 Node.js 服务端脚本，头部信息以 JS 块注释书写。
 * - Key 只存在服务端（.env），浏览器永远接触不到（任务一·把 Key 藏好）
 * - system 提示词把模型"管住"成中华美食街在线客服（任务二·客服人设改造）
 * - 支持硅基流动 / 七牛双平台热切换，切换只改 .env + 前端下拉框（任务三）
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3005;

// SYSTEM_PROMPT：客服人设提示词（任务二核心）。三类问题照答，其余礼貌拒绝并引导留言。
// 写法要点：① 身份具体（叫什么、在哪工作）② 范围用"只回答+逐条列举"收窄
// ③ 给出标准拒绝话术，让模型拒答时有现成台词可抄 ④ 限定回答风格（简短、中文）
const SYSTEM_PROMPT = `你是"中华美食街"的在线客服小美。
你只回答以下三类问题：
1. 营业时间：每天 10:00-22:00，全年无休。
2. 招牌菜：秘制烤鸭（98元/份）、麻辣香锅（58元/份起）、手工水饺（28元/份）。
3. 配菜范围：可加青菜、豆腐、宽粉、鹌鹑蛋（各 3 元）；荤菜加牛肉丸、午餐肉（各 6 元）。
顾客问到这三类之外的问题（写代码、讲笑话、天气、闲聊等），一律用下面这句礼貌拒绝并引导留言：
"抱歉，这个问题超出客服范围啦～您可以留言给我们，或到店咨询，我们会尽快回复您！"
回答保持简短友好，一律使用中文。`;

// readEnvConfig：手工解析项目根目录的 .env 文件，返回配置对象（不引入额外依赖）
function readEnvConfig() {
  const envPath = path.join(__dirname, '..', '.env');
  const config = {};
  if (!fs.existsSync(envPath)) {
    console.error('[ai-server] 未找到 .env 配置文件：' + envPath);
    return config;
  }
  // 逐行解析 KEY=VALUE，跳过注释和空行
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const idx = t.indexOf('=');
    if (idx > 0) config[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  });
  return config;
}

const ENV = readEnvConfig();

// buildProviders：把 .env 里的双平台配置整理成统一结构的提供商表
// 换平台只需要 .env 里改 baseUrl / model / apiKey 三个值，代码零改动
function buildProviders() {
  const list = {
    siliconflow: {
      label: '硅基流动 Qwen',
      baseUrl: ENV.SILICONFLOW_BASE_URL,
      model: ENV.SILICONFLOW_MODEL,
      apiKey: ENV.SILICONFLOW_API_KEY
    },
    qiniu: {
      label: '七牛客服',
      baseUrl: ENV.QINIU_CUSTOMER_SERVICE_BASE_URL,
      model: ENV.QINIU_CUSTOMER_SERVICE_MODEL,
      apiKey: ENV.QINIU_CUSTOMER_SERVICE_API_KEY
    }
  };
  // 剔除配置不完整的平台（比如 .env 没填某家的 Key）
  return Object.fromEntries(
    Object.entries(list).filter(([, c]) => c.baseUrl && c.model && c.apiKey)
  );
}

const PROVIDERS = buildProviders();
const DEFAULT_PROVIDER = ENV.AI_PROVIDER && PROVIDERS[ENV.AI_PROVIDER] ? ENV.AI_PROVIDER : Object.keys(PROVIDERS)[0];

app.use(express.json());

// 通用跨域响应头：允许本地任意页面（file:// 或其他端口）调用本服务
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// GET /providers：返回可用平台列表（只给 label/model/是否配置好，绝不回传 Key）
app.get('/providers', (req, res) => {
  res.json({
    default: DEFAULT_PROVIDER,
    providers: Object.entries(PROVIDERS).map(([id, c]) => ({
      id,
      label: c.label,
      model: c.model
    }))
  });
});

// callLLM：向指定平台发起对话请求（两家都是 OpenAI 兼容的 /chat/completions 接口）
async function callLLM(providerId, messages) {
  const c = PROVIDERS[providerId];
  const resp = await fetch(c.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Key 只在服务器端使用，不暴露给浏览器
      'Authorization': 'Bearer ' + c.apiKey
    },
    body: JSON.stringify({ model: c.model, messages })
  });
  const data = await resp.json();
  if (!resp.ok) {
    const err = new Error(data.error?.message || '上游接口错误');
    err.status = resp.status;
    throw err;
  }
  return data.choices?.[0]?.message?.content || '(AI 未返回内容)';
}

// POST /api/chat：接收 { message, history, provider }，返回 AI 回复
app.post('/api/chat', async (req, res) => {
  const { message, history, provider } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '缺少 message 字段' });
  }

  // 平台选择：前端下拉框传来的值存在才切换，否则用 .env 里的默认值
  const providerId = provider && PROVIDERS[provider] ? provider : DEFAULT_PROVIDER;

  // 组装对话历史：system 人设 + 历史消息 + 本次提问，最多保留最近 10 条防止超长
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: 'user', content: message }
  ];

  try {
    const reply = await callLLM(providerId, messages);
    res.json({ reply, provider: providerId, model: PROVIDERS[providerId].model });
  } catch (err) {
    console.error(`[ai-server] ${providerId} 请求失败:`, err.message);
    res.status(err.status || 502).json({ error: `${providerId} 平台请求失败：` + err.message });
  }
});

// mul_img：multer 内存存储，图片不落盘、直接 base64 后发给视觉模型
const mul_img = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// MIME → dataURL 前缀映射：构造 image_url 需要的 data:image/xxx;base64 地址
const IMG_MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp'
};

// POST /api/vision：图像识别——接收 multipart 字段 image 与可选 prompt，返回图片描述
app.post('/api/vision', mul_img.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未收到图片文件' });

    // 图片转 base64 dataURL，供视觉模型读取
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const mime = IMG_MIME[ext] || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${req.file.buffer.toString('base64')}`;
    const question = (req.body && req.body.prompt) || '请详细描述这张图片的内容。';

    // 视觉消息结构：content 是数组，文本 + image_url 两部分
    const messages = [
      { role: 'system', content: '你是图像识别助手，用简洁准确的中文描述图片内容。' },
      { role: 'user', content: [
        { type: 'text', text: question },
        { type: 'image_url', image_url: { url: dataUrl } }
      ]}
    ];
    const sf = PROVIDERS.siliconflow;
    const model = ENV.SILICONFLOW_VISION_MODEL || 'Qwen/Qwen3-VL-8B-Instruct';
    if (!sf.apiKey || !sf.baseUrl) {
      return res.status(500).json({ error: '服务器未配置硅基流动 API，请检查 .env 文件' });
    }

    // 控制台输出发送的数据（base64 太长，截断显示字节数）
    console.log('\n========== [视觉] 发送给大模型的数据 ==========');
    console.log('模型:', model, '| 图片:', req.file.originalname, `(${req.file.buffer.length} 字节)`, '| 问题:', question);
    console.log(JSON.stringify({ model, messages: [{ role: 'user', content: [ { type: 'text', text: question }, { type: 'image_url', image_url: { url: `(dataURL, ${dataUrl.length} 字符，已省略)` } } ] }] }, null, 2));

    const resp = await fetch(sf.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sf.apiKey
      },
      body: JSON.stringify({ model, messages })
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data.error?.message || '上游接口错误' });
    }

    // 控制台输出来自大模型的数据
    console.log('\n========== [视觉] 收到大模型的数据 ==========');
    console.log(JSON.stringify(data, null, 2));

    res.json({
      description: data.choices?.[0]?.message?.content || '(AI 未返回内容)',
      model
    });
  } catch (err) {
    console.error('[vision] 识别失败:', err.message);
    res.status(502).json({ error: '图像识别失败：' + err.message });
  }
});

// POST /api/asr：语音识别——接收 multipart 字段 audio，转成文字
// 主通道：七牛 Qwen-Audio-3.0-ASR-Flash；七牛认证失败时自动降级到硅基流动 SenseVoiceSmall
app.post('/api/asr', mul_img.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '未收到音频文件' });
  const sf = PROVIDERS.siliconflow;
  const qn = PROVIDERS.qiniu;

  // doASR：向指定平台 /audio/transcriptions 发请求，返回 {ok, data, baseUrl, model}
  const doASR = async (baseUrl, apiKey, model) => {
    // OpenAI 兼容的 /audio/transcriptions 接口：multipart 传 model + file
    const form = new FormData();
    form.append('model', model);
    // 音频不落盘：multer 内存 buffer 直接包成 Blob 发出去
    form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname || 'audio.webm');
    const resp = await fetch(baseUrl + '/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      body: form
    });
    const data = await resp.json();
    return { ok: resp.ok, data, model };
  };

  const logSend = (tag, model, baseUrl) => {
    console.log('\n========== [ASR] 发送给大模型的数据 ==========');
    console.log('通道:', tag, '| 模型:', model, '| 音频:', req.file.originalname, `(${req.file.buffer.length} 字节, ${req.file.mimetype})`);
    console.log(JSON.stringify({ endpoint: baseUrl + '/audio/transcriptions', model, file: `${req.file.originalname} (${req.file.buffer.length} 字节)` }, null, 2));
  };

  try {
    // ---- 主通道：七牛 ASR ----
    const qnModel = ENV.QINIU_ASR_MODEL || 'Qwen-Audio-3.0-ASR-Flash';
    if (!qn.apiKey || !qn.baseUrl) {
      return res.status(500).json({ error: '服务器未配置七牛 API，请检查 .env 文件' });
    }
    logSend('七牛(主)', qnModel, qn.baseUrl);
    let r = await doASR(qn.baseUrl, qn.apiKey, qnModel);

    // 认证失败（Key 无效）且硅基流动可用 → 自动降级，保证功能可用
    const authFail = !r.ok && (r.data?.error?.code === 'auth_api_key_invalid' || /invalid api key/i.test(r.data?.error?.message || r.data?.message || ''));
    if (authFail && sf.apiKey && sf.baseUrl) {
      console.log('[ASR] 七牛 Key 认证失败，自动降级到硅基流动 SenseVoiceSmall');
      const sfModel = ENV.SILICONFLOW_ASR_MODEL || 'FunAudioLLM/SenseVoiceSmall';
      logSend('硅基流动(降级)', sfModel, sf.baseUrl);
      r = await doASR(sf.baseUrl, sf.apiKey, sfModel);
    }

    if (!r.ok) {
      return res.status(502).json({ error: 'ASR 平台请求失败：' + (r.data?.error?.message || r.data?.message || '上游接口错误') });
    }

    // 控制台输出来自大模型的数据
    console.log('\n========== [ASR] 收到大模型的数据 ==========');
    console.log(JSON.stringify(r.data, null, 2));

    res.json({ text: r.data.text || '', model: r.model });
  } catch (err) {
    console.error('[asr] 识别失败:', err.message);
    res.status(502).json({ error: '语音识别失败：' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ai-server] AI 对话服务器已启动: http://localhost:${PORT}`);
  console.log(`[ai-server] 可用平台: ${Object.keys(PROVIDERS).join(', ')} | 默认: ${DEFAULT_PROVIDER}`);
});
