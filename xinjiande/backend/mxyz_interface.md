# mxyz_interface.md — 接口记录（追加写入，禁止覆盖）

接口路径 | HTTP 方法 | 请求参数（含示例） | 响应格式（含 JSON 示例） | 修改时间

/api/mxyz_health | GET | 无 | { "code": 0, "msg": "服务正常", "data": { "name": "mxyz-music-player", "time": "2026-11-20T00:00:00.000Z" } } | 2026-11-20

/api/mxyz_database_connect | POST | JSON 请求体：{ "mxyz_user": "root", "mxyz_password": "******", "mxyz_host": "localhost", "mxyz_port": "3306", "mxyz_database": "" }（mxyz_database 留空则仅测试服务器连接） | 成功：{ "code": 0, "msg": "数据库连接成功", "data": { "host": "localhost", "user": "root", "database": "(未指定数据库)", "server_version": "8.0.30", "databases": ["information_schema", "mysql", "performance_schema", "shop", "students", "sys", "马昕玉子214"] } }；失败：{ "code": 2, "msg": "数据库连接失败：Access denied for user 'root'@'localhost' (using password: YES)", "data": null } | 2026-11-20

/api/mxyz_tech_news | GET | 无（可选查询参数暂未启用） | 成功：{ "code": 0, "msg": "获取新闻列表成功", "data": { "total": 8, "list": [ { "id": 1, "title": "国产大模型推理成本再降 90%，开源社区迎来新一轮爆发", "summary": "多家厂商发布新一代 MoE 架构模型...", "source": "科技日报", "author": "马昕玉子", "publish_time": "2026-11-18T01:30:00.000Z", "created_at": "..." } ] } }；失败：{ "code": 1, "msg": "获取新闻列表失败：<错误信息>", "data": null } | 2026-11-20

/api/mxyz_images | GET | 无 | 成功：{ "code": 0, "msg": "获取图文列表成功", "data": { "total": 8, "list": [ { "id": 1, "title": "深夜 DJ 现场混音实录", "description": "俱乐部舞台上的 DJ 正在打碟台前混音...", "image_url": "/images/mxyz_gallery_01.jpg", "category": "现场演出", "publish_time": "2026-11-19T13:00:00.000Z", "created_at": "..." } ] } }；失败：{ "code": 1, "msg": "获取图文列表失败：<错误信息>", "data": null } | 2026-11-20
