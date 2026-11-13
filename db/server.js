/**
 * 作者：马昕玉子
 * 建立时间：2026-11-13
 * 使用大模型：GLM-5.3-Flash
 * 功能名称：诗词数据服务器（供 mxyz_poems.html 通过接口获取 db.json 中的 poems 数据）
 */

// 引入 express 框架，用于快速搭建 HTTP 服务器
const express = require('express');

// 引入 path 模块，用于处理文件路径
const path = require('path');

// 创建 express 应用实例
const app = express();

// 读取当前文件夹下的 db.json 数据文件
const db = require('./db.json');

// 中间件：为所有响应设置跨域头，允许前端页面跨域访问接口
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// 接口：GET /poems，返回 db.json 中 poems 数组（含 pic、title、content）
app.get('/poems', (req, res) => {
  res.json(db.poems);
});

// 接口：GET /img?url=xxx，图片代理——由服务器去请求外链图片（绕过 gitee 防盗链），
// 再把图片内容转发给浏览器，解决浏览器直接加载 gitee 图片被拒的问题
app.get('/img', async (req, res) => {
  try {
    // 使用 Node 18+ 内置的 fetch 从原始地址获取图片
    const response = await fetch(req.query.url);
    if (!response.ok) throw new Error('图片源响应异常：' + response.status);

    // 把原始图片的 Content-Type 透传给浏览器
    res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');

    // 将图片二进制数据转为 Buffer 后返回
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    // 代理失败时返回 404，前端 img 会显示加载失败状态
    res.status(404).send('图片获取失败：' + err.message);
  }
});

// 接口：GET /api/authors，从 poems 数据中提取去重后的作者列表
app.get('/api/authors', (req, res) => {
  // Set 用于去重，扩展运算符把 Set 转回数组
  const authors = [...new Set(db.poems.map(item => item.author))];
  res.json(authors);
});

// 静态资源：将 db 文件夹作为静态目录，可通过 /db.json 直接访问原文件
app.use(express.static(path.join(__dirname)));

// 启动服务器，监听 3004 端口
app.listen(3004, () => {
  console.log('诗词数据服务器已启动：http://localhost:3004/poems');
});
