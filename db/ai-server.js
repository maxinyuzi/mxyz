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

app.listen(PORT, () => {
  console.log(`[ai-server] AI 对话服务器已启动: http://localhost:${PORT}`);
  console.log(`[ai-server] 可用平台: ${Object.keys(PROVIDERS).join(', ')} | 默认: ${DEFAULT_PROVIDER}`);
});
