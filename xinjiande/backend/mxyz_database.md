# mxyz_database.md — 数据库记录（追加写入，禁止覆盖）

（每次建表、改表或插入数据后，按执行顺序在此追加对应 SQL 语句，含测试数据 INSERT，要求仅凭本文件即可在新机器上完整重建数据库。）

## 2026-11-20 科技新闻表

```sql
-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS mxyz_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mxyz_db;

-- 2. 创建科技新闻表
CREATE TABLE IF NOT EXISTS mxyz_tech_news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500),
  source VARCHAR(50),
  author VARCHAR(50),
  publish_time DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 插入 8 条测试数据
INSERT INTO mxyz_tech_news (title, summary, source, author, publish_time) VALUES
('国产大模型推理成本再降 90%，开源社区迎来新一轮爆发', '多家厂商发布新一代 MoE 架构模型，单位 token 推理成本大幅下降，开源社区下载量单周破千万。', '科技日报', '马昕玉子', '2026-11-18 09:30:00'),
('全球首条 1.4nm 芯片中试线量产成功', '先进制程中试线实现良率 92%，下一代移动旗舰芯片预计明年上半年发布。', '电子时报', '李工', '2026-11-17 14:20:00'),
('固态电池量产成本跌破关键节点，车企密集发布新车计划', '能量密度 500Wh/kg 的固态电池开始装车测试，首批车型续航突破 1500 公里。', '汽车之家', '王欣', '2026-11-16 10:05:00'),
('量子计算云平台用户突破 100 万', '国内量子云平台开放 QPU 免费试用后，注册开发者数量半年增长 8 倍。', '新华网', '赵明', '2026-11-15 16:40:00'),
('人形机器人进入工厂实训阶段', '某汽车工厂引入 50 台人形机器人参与装配线实训，平均无故障时间达到 300 小时。', '第一财经', '陈晨', '2026-11-14 11:15:00'),
('低空经济新规落地，城市无人机配送网络加速铺开', '多地发放常态化运营牌照，无人机配送日均单量突破 50 万单。', '经济观察报', '孙悦', '2026-11-13 08:50:00'),
('卫星互联网手机直连服务正式商用', '三大运营商推出手机直连卫星套餐，实现无地面网络区域的消息与语音通信。', '通信产业报', '周正', '2026-11-12 13:30:00'),
('AI 制药管线首次进入 III 期临床', '由大模型辅助设计的候选药物在 III 期临床试验中达到主要终点，研发周期缩短 60%。', '医药经济报', '吴静', '2026-11-11 15:00:00');
```

## 2026-11-20 图文列表表

```sql
-- 1. 创建图文列表表（图片文件位于 frontend/images/，由 express.static 托管）
USE mxyz_db;

CREATE TABLE IF NOT EXISTS mxyz_image_texts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  image_url VARCHAR(300) NOT NULL,
  category VARCHAR(50),
  publish_time DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 插入 8 条测试数据（图片文件 mxyz_gallery_01.jpg ~ mxyz_gallery_08.jpg 需存在于 frontend/images/ 目录）
INSERT INTO mxyz_image_texts (title, description, image_url, category, publish_time) VALUES
('深夜 DJ 现场混音实录', '俱乐部舞台上的 DJ 正在打碟台前混音，紫色镭射灯光交织，气氛热烈。', '/images/mxyz_gallery_01.jpg', '现场演出', '2026-11-19 21:00:00'),
('演唱会舞台高光时刻', '歌手在紫色与蓝色舞台灯光下演出，聚光灯勾勒出动人剪影。', '/images/mxyz_gallery_02.jpg', '现场演出', '2026-11-18 20:30:00'),
('探秘专业录音棚', '调音台、监听耳机与紫色 LED 氛围灯，展现音乐制作背后的专业环境。', '/images/mxyz_gallery_03.jpg', '音乐制作', '2026-11-17 15:20:00'),
('街头听歌的夜晚', '都市夜色中戴上耳机的年轻人，霓虹灯虚化成梦幻光斑。', '/images/mxyz_gallery_04.jpg', '音乐生活', '2026-11-16 19:10:00'),
('排练室里的木吉他', '原声吉他斜靠在复古音箱旁，午后阳光洒进温馨的排练室。', '/images/mxyz_gallery_05.jpg', '乐器赏析', '2026-11-15 14:00:00'),
('日落音乐节人海', '户外音乐节落日时分，观众高举双手与远处绚丽舞台遥相呼应。', '/images/mxyz_gallery_06.jpg', '现场演出', '2026-11-14 18:40:00'),
('琴键与乐谱的对话', '钢琴键的微距特写配以乐谱，优雅光影中感受古典之美。', '/images/mxyz_gallery_07.jpg', '乐器赏析', '2026-11-13 10:25:00'),
('复古磁带收藏图鉴', '磁带与音乐海报的复古静物，重现 80 年代黄金岁月的质感。', '/images/mxyz_gallery_08.jpg', '音乐生活', '2026-11-12 16:50:00');
```
