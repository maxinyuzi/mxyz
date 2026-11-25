/**
 * 作者：马昕玉子
 * 建立时间：2026-11-25
 * 使用大模型：GLM-5.3-Flash
 * 功能名称：RAG 知识库问答服务器（上传/解析/检索/问答/管理，端口 3006）
 *
 * 流程：上传文件 → 解析成文本 → 切块存储 → 提问时按关键词检索相关块
 *      → 把"检索到的资料 + 问题"一起发给大模型 → 返回回答与来源
 * 要求落实：控制台完整输出发送给大模型的数据与收到自大模型的数据。
 * 支持：doc/docx（mammoth/兜底）、ppt/pptx（jszip 解析）、pdf（pdf-parse）、txt。
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const JSZip = require('jszip');

const app = express();
const PORT = 3006;
const KB_DIR = path.join(__dirname, 'kb_data');      // 知识库持久化目录
if (!fs.existsSync(KB_DIR)) fs.mkdirSync(KB_DIR, { recursive: true });

// readEnvConfig：手工解析根目录 .env，取得大模型平台配置（Key 不入前端）
function readEnvConfig() {
  const envPath = path.join(__dirname, '..', '.env');
  const config = {};
  if (!fs.existsSync(envPath)) return config;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const idx = t.indexOf('=');
    if (idx > 0) config[t.slice(0, idx).trim()] = t.slice(idx + 1).trim();
  });
  return config;
}
const ENV = readEnvConfig();

// 平台表：与 ai-server 保持一致的切换能力，RAG 问答默认走硅基流动
const PROVIDERS = {
  siliconflow: {
    baseUrl: ENV.SILICONFLOW_BASE_URL,
    model: ENV.SILICONFLOW_MODEL,
    apiKey: ENV.SILICONFLOW_API_KEY
  },
  qiniu: {
    baseUrl: ENV.QINIU_CUSTOMER_SERVICE_BASE_URL,
    model: ENV.QINIU_CUSTOMER_SERVICE_MODEL,
    apiKey: ENV.QINIU_CUSTOMER_SERVICE_API_KEY
  }
};
const DEFAULT_PROVIDER = ['siliconflow', 'qiniu'].find(p => PROVIDERS[p].apiKey && PROVIDERS[p].baseUrl) || 'siliconflow';

// mul_upload：multer 内存存储，文件不落盘、直接在内存里解析
const mul_upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// parseDocx：docx → 文本（mammoth 提取正文段落）
async function parseDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

// parsePptx：pptx（本质是 zip）→ 逐页提取 <a:t> 文本节点拼接
async function parsePptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  const texts = [];
  for (const name of slideFiles) {
    const xml = await zip.files[name].async('string');
    // 幻灯片里的文字都在 <a:t>…</a:t> 节点里，正则提取后按页拼接
    const runs = [...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(m => m[1]);
    texts.push(runs.join(' '));
  }
  return texts.join('\n');
}

// parsePdf：pdf → 文本
async function parsePdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// parseTxt：txt → 文本（utf8 读取）
function parseTxt(buffer) {
  return buffer.toString('utf8');
}

// parseBinaryFallback：老格式 .doc / .ppt（二进制 OLE）的兜底解析：
// Word/PPT 97 文本常以 UTF-16LE 存储，尝试解码并抽取可读字符序列
function parseBinaryFallback(buffer) {
  const raw = buffer.toString('utf16le');
  // 抽取连续的中文/字母/数字片段（长度>=2 视为有效词），过滤乱码
  const runs = raw.match(/[\u4e00-\u9fa5A-Za-z0-9，。：；！？、%．\-—]{2,}/g) || [];
  return runs.join(' ');
}

// parseFile：按扩展名分发解析器，返回 { text, parser }
async function parseFile(filename, buffer) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.docx': return { text: await parseDocx(buffer), parser: 'mammoth(docx)' };
    case '.pptx': return { text: await parsePptx(buffer), parser: 'jszip(pptx)' };
    case '.pdf':  return { text: await parsePdf(buffer), parser: 'pdf-parse' };
    case '.txt':
    case '.md':   return { text: parseTxt(buffer), parser: 'utf8(txt)' };
    case '.doc':
    case '.ppt':  return { text: parseBinaryFallback(buffer), parser: 'binary-fallback(老格式，效果有限)' };
    default:
      throw new Error('不支持的文件类型：' + ext + '（支持 doc/docx/ppt/pptx/pdf/txt/md）');
  }
}

// chunkText：把长文本切成约 350 字的块（按段落聚合，块间保留少量重叠语义）
function chunkText(text) {
  // 统一换行 → 按段落拆 → 空段落丢弃
  const paras = text.replace(/\r\n?/g, '\n').split(/\n+/).map(s => s.trim()).filter(Boolean);
  const chunks = [];
  let cur = '';
  for (const p of paras) {
    // 当前块加上新段落超 350 字就先落盘，再开新块
    if (cur && (cur + '\n' + p).length > 350) {
      chunks.push(cur);
      cur = p;
    } else {
      cur = cur ? cur + '\n' + p : p;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

// tokenize：提取检索词——英文按单词，中文按 2 字滑窗 bigram（单字噪声大）
function tokenize(text) {
  const terms = [];
  const lower = text.toLowerCase();
  for (const m of lower.matchAll(/[a-z0-9]+/g)) terms.push(m[0]);
  const cjkRuns = text.match(/[\u4e00-\u9fa5]+/g) || [];
  for (const run of cjkRuns) {
    for (let i = 0; i < run.length - 1; i++) terms.push(run.slice(i, i + 2));
  }
  return terms;
}

// loadAllDocs：从 kb_data 目录加载全部知识库文档
function loadAllDocs() {
  const docs = [];
  for (const f of fs.readdirSync(KB_DIR)) {
    if (!f.endsWith('.json')) continue;
    try {
      docs.push(JSON.parse(fs.readFileSync(path.join(KB_DIR, f), 'utf8')));
    } catch (e) {
      console.error('[rag] 跳过损坏的知识库文件:', f);
    }
  }
  return docs;
}

// searchKB：关键词检索——对每块按词频打分，返回得分最高的前 3 块
function searchKB(question, docs) {
  const terms = [...new Set(tokenize(question))];
  if (terms.length === 0) return [];
  const results = [];
  for (const doc of docs) {
    doc.chunks.forEach((chunk, idx) => {
      let score = 0;
      for (const t of terms) {
        // 每个检索词在该块出现一次计 1 分，乘 1.05^命中词数拉开区分度
        const hits = chunk.text.split(t).length - 1;
        if (hits > 0) score += hits;
      }
      if (score > 0) results.push({ doc: doc.name, chunkIndex: idx, score, text: chunk.text });
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

// callLLM：调用所选平台的 /chat/completions（OpenAI 兼容格式）
async function callLLM(providerId, messages) {
  const c = PROVIDERS[providerId];
  const resp = await fetch(c.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + c.apiKey },
    body: JSON.stringify({ model: c.model, messages })
  });
  const data = await resp.json();
  if (!resp.ok) {
    const err = new Error(data.error?.message || '上游接口错误');
    err.status = resp.status;
    throw err;
  }
  return data;
}

// ===== 知识库管理接口 =====

// GET /api/kb/list：知识库列表（文档名、块数、上传时间）
app.get('/api/kb/list', (req, res) => {
  const docs = loadAllDocs().map(d => ({
    id: d.id, name: d.name, ext: d.ext,
    chunks: d.chunks.length, chars: d.chunks.reduce((s, c) => s + c.text.length, 0),
    uploadedAt: d.uploadedAt
  }));
  res.json({ docs });
});

// POST /api/kb/upload：上传并解析知识库文件（multipart 字段名 file）
app.post('/api/kb/upload', mul_upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '未收到文件' });
    let { buffer, originalname } = req.file;
    // 修复乱码：部分客户端（如 curl）把中文文件名按 latin1 发送，转回 utf8
    if (/[ÃÂäåæçèéêñòóôõöØ]/.test(originalname)) {
      try { originalname = Buffer.from(originalname, 'latin1').toString('utf8'); } catch (e) { /* 保持原名 */ }
    }
    // 1) 解析成文本 → 2) 切块 → 3) 存盘
    const { text, parser } = await parseFile(originalname, buffer);
    if (!text.trim()) return res.status(400).json({ error: '文件解析结果为空，可能是老格式解析失败' });
    const chunks = chunkText(text);
    const doc = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name: originalname,
      ext: path.extname(originalname).toLowerCase(),
      parser,
      uploadedAt: new Date().toLocaleString('zh-CN'),
      chunks: chunks.map((text, i) => ({ index: i, text }))
    };
    fs.writeFileSync(path.join(KB_DIR, doc.id + '.json'), JSON.stringify(doc, null, 2));
    console.log(`[rag] 知识库入库: ${doc.name} (${parser}) → ${chunks.length} 块`);
    res.json({ ok: true, id: doc.id, name: doc.name, parser, chunks: chunks.length });
  } catch (err) {
    console.error('[rag] 上传解析失败:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/kb/:id：删除指定知识库文档
app.delete('/api/kb/:id', (req, res) => {
  const file = path.join(KB_DIR, req.params.id + '.json');
  // 防路径穿越：id 里不允许出现路径分隔符
  if (req.params.id.includes('/') || req.params.id.includes('\\') || !fs.existsSync(file)) {
    return res.status(404).json({ error: '知识库文档不存在' });
  }
  fs.unlinkSync(file);
  console.log('[rag] 知识库已删除:', req.params.id);
  res.json({ ok: true });
});

// GET /api/kb/providers：给前端下拉框用（不含 Key）
app.get('/api/kb/providers', (req, res) => {
  res.json({
    default: DEFAULT_PROVIDER,
    providers: Object.entries(PROVIDERS)
      .filter(([, c]) => c.apiKey && c.baseUrl)
      .map(([id, c]) => ({ id, model: c.model }))
  });
});

// POST /api/rag/chat：基于知识库的问答主流程
app.post('/api/rag/chat', async (req, res) => {
  const { message, provider } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '缺少 message 字段' });
  }
  const providerId = provider && PROVIDERS[provider] ? provider : DEFAULT_PROVIDER;

  // 1) 检索：拿到与问题最相关的知识块
  const hits = searchKB(message, loadAllDocs());

  // 2) 组装上下文：没检索到就明确告知模型"知识库里没有资料"，防止它瞎编
  const context = hits.length
    ? hits.map(h => `【来源:${h.doc} 第${h.chunkIndex + 1}块】\n${h.text}`).join('\n\n')
    : '（知识库中没有检索到与问题相关的内容）';

  // 3) 组装消息数组：system 规定"只依据资料回答" + 资料塞进 user 消息
  const messages = [
    {
      role: 'system',
      content: '你是"中华美食街"的智能客服。你必须只依据用户消息中提供的【知识库资料】回答问题，资料里没有的信息就回答"抱歉，知识库中暂时没有这方面的信息"。回答简短、友好、使用中文。'
    },
    { role: 'user', content: `【知识库资料】\n${context}\n\n【问题】${message}` }
  ];

  // 4) 按作业要求：控制台完整输出发送给大模型的数据
  console.log('\n========== [RAG] 发送给大模型的数据 ==========');
  console.log('平台:', providerId, '| 模型:', PROVIDERS[providerId].model);
  console.log('检索命中:', hits.length ? `${hits.length} 块（得分: ${hits.map(h => h.score).join(',')}）` : '0 块');
  console.log(JSON.stringify({ model: PROVIDERS[providerId].model, messages }, null, 2));

  try {
    const data = await callLLM(providerId, messages);
    const answer = data.choices?.[0]?.message?.content || '(AI 未返回内容)';

    // 5) 按作业要求：控制台完整输出来自大模型的数据
    console.log('\n========== [RAG] 收到大模型的数据 ==========');
    console.log(JSON.stringify(data, null, 2));

    res.json({
      answer,
      sources: hits.map(h => ({ doc: h.doc, chunkIndex: h.chunkIndex, score: h.score })),
      provider: providerId
    });
  } catch (err) {
    console.error('[rag] LLM 请求失败:', err.message);
    res.status(err.status || 502).json({ error: 'AI 平台请求失败：' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[rag] RAG 知识库服务器已启动: http://localhost:${PORT}`);
  console.log(`[rag] 默认平台: ${DEFAULT_PROVIDER} | 知识库目录: ${KB_DIR}`);
});
