/**
 * 作者：马昕玉子
 * 建立时间：2026-11-25
 * 使用大模型：GLM-5.3-Flash
 * 功能名称：AI 对话数据服务器（硅基流动 Qwen 模型代理，端口 3005）
 *
 * 说明：本文件为 Node.js 服务端脚本，头部信息以 JS 块注释书写。
 */

/**
 * AI 对话服务器：前端绝不持有 API Key，
 * 浏览器只请求本服务的 /api/chat，由本服务携带 Key 转发到硅基流动。
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3005;

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

const CONFIG = readEnvConfig();

app.use(express.json());

// 通用跨域响应头：允许本地任意页面（file:// 或其他端口）调用本服务
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// GET /health：健康检查，确认配置加载成功（不回传 Key 本身）
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    model: CONFIG.SILICONFLOW_MODEL || '(未配置)',
    hasKey: !!CONFIG.SILICONFLOW_API_KEY
  });
});

// POST /api/chat：接收 { message, history }，转发硅基流动对话接口并返回 AI 回复
app.post('/api/chat', async (req, res) => {
  // 配置缺失检查：Key 或模型没配置直接报错，避免无意义的外部请求
  if (!CONFIG.SILICONFLOW_API_KEY || !CONFIG.SILICONFLOW_BASE_URL) {
    return res.status(500).json({ error: '服务器未配置 API Key，请检查 .env 文件' });
  }

  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '缺少 message 字段' });
  }

  // 组装对话历史：system 固定人设 + 历史消息 + 本次提问，最多保留最近 10 条防止超长
  const messages = [
    { role: 'system', content: '你是马昕玉子作品集网站里的 AI 助手，回答简洁友好，使用中文。' },
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: 'user', content: message }
  ];

  try {
    const resp = await fetch(CONFIG.SILICONFLOW_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Key 只在服务器端使用，不暴露给浏览器
        'Authorization': 'Bearer ' + CONFIG.SILICONFLOW_API_KEY
      },
      body: JSON.stringify({
        model: CONFIG.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
        messages
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      // 上游报错：透传状态码与信息，方便排查
      return res.status(resp.status).json({ error: data.error?.message || '上游接口错误' });
    }
    res.json({ reply: data.choices?.[0]?.message?.content || '(AI 未返回内容)' });
  } catch (err) {
    console.error('[ai-server] 请求失败:', err.message);
    res.status(502).json({ error: '连接 AI 服务失败：' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[ai-server] AI 对话服务器已启动: http://localhost:${PORT}`);
  console.log(`[ai-server] 模型: ${CONFIG.SILICONFLOW_MODEL || '未配置'} | Key: ${CONFIG.SILICONFLOW_API_KEY ? '已加载' : '缺失!'}`);
});
