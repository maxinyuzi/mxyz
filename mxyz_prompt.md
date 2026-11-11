# mxyz 提示词日志

---

## 2026-10-23 19:01:09
- 模型：Kimi-K3
- 提示词：设置规则：从现在开始，所有CSS类名，id名、js变量都以mxyz_开始，所有的提示词都在执行之前写入文件mxyz_prompt.md，以附加的方式写入，不覆盖之前的内容，写入的内容包括时间、使用的模型、提示词内容。

---

## 2026-10-23 19:03:26
- 模型：Kimi-K3
- 提示词：设置规则：所有新建的html文件加入超链接入口到首页index.html

---

## 2026-10-23 19:05:12
- 模型：Kimi-K3
- 提示词：使用当前目录下skills文件夹中的frontend-designskill做两个html网页iconfont-1.html,inconfont-2.html，使得页面具有艺术品牌的样式。分别显示font awesome图标和lucide图标，前者使用字体图标的方式，后者使用svg的方式，相关的cdn文件下载到本目录下的cdn目录。

---

## 2026-10-23 19:16:45
- 模型：GLM-5.3-Flash
- 提示词：根据font目录中的iconfont图标完成移动端的固定的自适应宽度的下导航，导航项目包括4个，完成html网页的设计，网页名称iconfont-3.html和iconfont-4.html分别使用字体图标和svg，包括右上角的数字徽章和红点。

---

## 2026-10-23 19:28:03
- 模型：GLM-5.3-Flash
- 提示词：创建skill:提交项目：使用git commit并push到gitee仓库，gitee私人令牌1e58a5c93606eb1daab1f669551943d0;仓库地址:`https://gitee.com/ma-xinyu-zi/maxinyuzi.git`。

---

## 2026-10-30 14:18:49
- 模型：GLM-5.3-Flash
- 提示词：获得 git 公钥，没有则先创建一个

---

## 2026-10-30 14:46:48
- 模型：GLM-5.3-Flash
- 提示词：创建技能skill：提交到github，将本项目提交commit并push到`https://github.com/maxinyuzi/mxyz.git`，使用已设置公钥。（注：用户原输入仓库名 wangyaojsj/wangyao 后中断更正为 maxinyuzi/mxyz）

---

## 2026-11-04 13:35:06
- 模型：GLM-5.3-Flash
- 提示词：修改规则文件AGENTS.md，在新建html文件时加入注释，注释包括：马昕玉子，建立时间，使用大模型，功能名称。在js部分函数加上函数主要实现功能的注释。

---

## 2026-11-04 13:43:14
- 模型：GLM-5.3-Flash
- 提示词：请给我新建一个html文件，显示tab选项卡，选项卡分别为：国内新闻、省内新闻、国际新闻、最热新闻，国内新闻设定为默认选项。js文件单独放在js文件夹中，外部引用。要求js中的tab选项卡可复用，实现代码中的包含监听事件、先清除所有选项卡的选中状态，然后再设置当前元素的选中状态。

---

## 2026-11-04 14:01:26
- 模型：GLM-5.3-Flash
- 提示词：要求项目一比一还原（依据 Desktop\7 下 1-5.jpg 汽车资讯 tab 选项卡截图），代码按照之前设定的规则，所有 CSS 类名、id、JS 变量必须以 `mxyz_` 开头，注释也要有我的姓名。github仓库名称要包含自己姓名全拼。

---

## 2026-11-04 14:11:55
- 模型：GLM-5.3-Flash
- 提示词：好的，我去 GitHub 改名（用户确认去 GitHub 网页将仓库改名为包含姓名全拼的名称）

---

## 2026-11-04 14:13:48
- 模型：GLM-5.3-Flash
- 提示词：好的，执行吧（执行首次提交：git init → 排除含令牌的敏感文件 → commit → 推送 GitHub 与 Gitee）

---

## 2026-11-04 14:16:20
- 模型：GLM-5.3-Flash
- 提示词：提交到guthub（用户指示仅提交推送到 GitHub，暂不推 Gitee）

---

## 2026-11-04 14:19:05
- 模型：GLM-5.3-Flash
- 提示词：提交到mxyz的仓库（仓库确定为 maxinyuzi/mxyz；22 端口被拒，改用 ssh.github.com:443 通道推送）

---

## 2026-11-04 14:23:52
- 模型：GLM-5.3-Flash
- 提示词：提交到 gitee（将当前 main 推送到 Gitee 仓库 ma-xinyu-zi/maxinyuzi，HTTPS+私人令牌认证）

---

## 2026-11-04 14:33:03
- 模型：GLM-5.3-Flash
- 提示词：打不开了（确认为 GitHub 仓库网页打不开）
- 诊断结论：DNS 正常解析到 GitHub 真实 IP（20.205.243.166），但 https://github.com 与 https://api.github.com 的 TCP 连接被立即重置（HTTP 000，0.08s 断开）——网络层屏蔽网页端；Gitee 正常（403 为反爬响应，可达）。git 推送走 ssh.github.com:443 未受影响，仓库内容确认已在 GitHub 上。

---

## 2026-11-04 14:40:26
- 模型：GLM-5.3-Flash
- 提示词：我要那个恢复到"要求项目一比一还原……"这个时候（index.html 恢复到该任务开始时状态：保留入口 1-10，去掉入口 11）

---

## 2026-11-04 14:45:23
- 模型：GLM-5.3-Flash
- 提示词：要求项目一比一还原，代码按照之前设定的规则，所有 CSS 类名、id、JS 变量必须以 `mxyz_` 开头，注释也要有我的姓名。github仓库名称要包含自己姓名全拼（第二次执行：auto-tab.html 与 js 仍在磁盘，补回 index.html 入口 11 并重新验证）

---

## 2026-11-04 14:48:26
- 模型：GLM-5.3-Flash
- 提示词：提交到github（提交 index.html 入口 11 恢复与日志更新，推送 GitHub）

---

## 2026-11-04 14:50:19
- 模型：GLM-5.3-Flash
- 提示词：返回上一步（确认为撤销刚才的提交推送 adecc0c：本地 reset 回 56a9724，GitHub 用 --force-with-lease 同步回退）

---

## 2026-11-04 14:59:05
- 模型：GLM-5.3-Flash
- 提示词：要求项目一比一还原，代码按照之前设定的规则，所有 CSS 类名、id、JS 变量必须以 `mxyz_` 开头，注释也要有我的姓名。github仓库名称要包含自己姓名全拼（第三次执行：核对现状，无需改动文件）

---

## 2026-11-04 15:03:07
- 模型：GLM-5.3-Flash
- 提示词：恢复到"要求项目一比一还原……"状态（第四次；经核对当前已处于该状态，无需改动）

---

## 2026-11-11 13:17:28
- 模型：GLM-5.3-Flash
- 提示词：帮我提交到GitHub里（提交新增的 swiper 轮播作业：swiper-task.html、starter-level1-0214-mxyz.html、data.js、swiper 库、swiper-imgs 图片、7 目录参考截图，并推送 GitHub）

---

## 2026-11-11 13:19:35
- 模型：GLM-5.3-Flash
- 提示词：提交到 gitee（将 fca20c0 同步推送到 Gitee 仓库 ma-xinyu-zi/maxinyuzi，HTTPS+私人令牌认证）

---

## 2026-11-11 13:21:58
- 模型：GLM-5.3-Flash
- 提示词：把swiper-task.html添加到index里然后重新提交（index.html 加入口 12，提交并推送 GitHub 与 Gitee）
