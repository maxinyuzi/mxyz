/**
 * 作者：马昕玉子
 * 建立时间：2026-11-25
 * 使用大模型：GLM-5.3-Flash
 * 功能名称：生成 2 个示例知识库文件（中华美食街：docx 菜单手册 + pptx 会员活动政策）
 *
 * 运行：node create-sample-kb.js（在 db 目录下执行）
 * 产物：kb_files/中华美食街_菜单手册.docx、kb_files/中华美食街_会员活动政策.pptx
 */
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');
const PptxGenJS = require('pptxgenjs');

const OUT_DIR = path.join(__dirname, '..', 'kb_files');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// makeDocx：生成"菜单手册"docx 知识库文件
async function makeDocx() {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: '中华美食街 · 菜单手册', heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: '一、营业信息' }),
        new Paragraph({ children: [new TextRun('营业时间：每天 10:00-22:00，全年无休。地址：美食城一楼 A12 档口。订餐电话：0571-8888-6666。')] }),
        new Paragraph({ text: '二、招牌菜与价格' }),
        new Paragraph({ children: [new TextRun('1. 秘制烤鸭：98 元/份，每日限量 30 份，建议提前预订。')] }),
        new Paragraph({ children: [new TextRun('2. 麻辣香锅：58 元/份起，辣度可选微辣/中辣/特辣。')] }),
        new Paragraph({ children: [new TextRun('3. 手工水饺：28 元/份（12 只），有猪肉白菜、韭菜鸡蛋、三鲜三种馅。')] }),
        new Paragraph({ text: '三、配菜与加料' }),
        new Paragraph({ children: [new TextRun('素菜加料：青菜、豆腐、宽粉、鹌鹑蛋，每份 3 元。')] }),
        new Paragraph({ children: [new TextRun('荤菜加料：牛肉丸、午餐肉，每份 6 元。')] }),
        new Paragraph({ text: '四、退换与售后' }),
        new Paragraph({ children: [new TextRun('菜品出餐 10 分钟内可无条件退换；超过 10 分钟需提供具体原因，由店长审核。')] })
      ]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT_DIR, '中华美食街_菜单手册.docx'), buf);
  console.log('已生成：kb_files/中华美食街_菜单手册.docx');
}

// makePptx：生成"会员活动政策"pptx 知识库文件
async function makePptx() {
  const pptx = new PptxGenJS();
  pptx.addSlide().addText('中华美食街 · 会员与活动政策', { x: 0.5, y: 1.2, fontSize: 32, bold: true });
  pptx.addSlide().addText([
    { text: '会员等级\n', options: { fontSize: 24, bold: true } },
    { text: '普通会员：注册即得，消费 1 元积 1 分。\n银卡会员：累计消费满 500 元升级，积分 1.2 倍。\n金卡会员：累计消费满 2000 元升级，积分 1.5 倍，生日赠菜一份。', options: { fontSize: 18 } }
  ], { x: 0.6, y: 0.6, w: 8.5 });
  pptx.addSlide().addText([
    { text: '优惠活动\n', options: { fontSize: 24, bold: true } },
    { text: '周一会员日：全场菜品 8.8 折。\n第二份半价：手工水饺每日 14:00-17:00 第二份半价。\n满减券：单笔满 128 元减 20 元，可与会员折扣叠加。', options: { fontSize: 18 } }
  ], { x: 0.6, y: 0.6, w: 8.5 });
  pptx.addSlide().addText([
    { text: '积分规则\n', options: { fontSize: 24, bold: true } },
    { text: '积分有效期 12 个月，100 积分抵 1 元。\n积分不可转让、不可提现。\n退换餐时对应积分同步扣除。', options: { fontSize: 18 } }
  ], { x: 0.6, y: 0.6, w: 8.5 });
  await pptx.writeFile({ fileName: path.join(OUT_DIR, '中华美食街_会员活动政策.pptx') });
  console.log('已生成：kb_files/中华美食街_会员活动政策.pptx');
}

// main：依次生成两个知识库文件
(async () => {
  await makeDocx();
  await makePptx();
  console.log('全部知识库文件生成完毕');
})();
