---
name: commit-push
description: 提交项目并推送到 Gitee 仓库（ma-xinyu-zi/maxinyuzi）。当用户要求"提交项目"、"commit 并 push"、"提交/推送到 gitee"时使用。
---

# 提交项目到 Gitee

将当前项目（c:\Users\31423\Desktop\新建文件夹）用 git 提交并推送到 Gitee 远程仓库。

## 仓库信息

- 远程仓库：`https://gitee.com/ma-xinyu-zi/maxinyuzi.git`
- Gitee 用户名：`ma-xinyu-zi`
- 私人令牌（作为 HTTPS 密码使用）：`1e58a5c93606eb1daab1f669551943d0`
- 带认证的推送地址：
  `https://ma-xinyu-zi:1e58a5c93606eb1daab1f669551943d0@gitee.com/ma-xinyu-zi/maxinyuzi.git`

## 执行步骤

1. 进入项目根目录 `c:\Users\31423\Desktop\新建文件夹`。
2. 若不存在 `.git` 目录，先执行 `git init -b main` 初始化仓库。
3. 检查提交身份：`git config user.name` 与 `git config user.email`。若未配置，先向用户询问邮箱，再用 `git config --local user.name "ma-xinyu-zi"` 与 `git config --local user.email "<用户邮箱>"` 设置（仅对本仓库生效，不改全局配置）。
4. 运行 `git status` 与 `git diff` 查看变更内容。提交前确认不包含敏感文件（.env、令牌文件、密钥等）；如发现敏感文件，排除并向用户说明。
5. 暂存变更：优先 `git add <具体文件>`；文件数量多时可用 `git add -A`，但必须先完成第 4 步检查。
6. 提交：`git commit -m "<简洁中文描述，一句概括本次提交的目的>"`。若无变更则不创建空提交，直接告知用户。
7. 配置远程：
   - 首次：`git remote add gitee https://ma-xinyu-zi:1e58a5c93606eb1daab1f669551943d0@gitee.com/ma-xinyu-zi/maxinyuzi.git`
   - 若远程 `gitee` 已存在：`git remote set-url gitee <带认证的推送地址>`
8. 推送：首次执行 `git push -u gitee main`；之后执行 `git push gitee main`（若当前分支不是 main，推送当前分支并说明）。
9. 推送成功后运行 `git status` 确认工作区干净，并向用户报告：提交信息、推送分支、远程地址。

## 常见错误处理

- `403` 或认证失败：令牌过期、被撤销或权限不足——向用户索要新的私人令牌，更新本文件与远程地址后重试。
- 推送被拒绝（non-fast-forward）：先执行 `git pull --rebase gitee main`，解决冲突后再推送。
- 网络超时：重试一次；仍失败则报告用户，不要反复重试。

## 安全提示

- 令牌已按用户要求明文写入本文件。若怀疑泄露，请到 Gitee「设置 → 私人令牌」撤销并重建，同时更新本文件中的令牌与远程地址。
- 不要把带令牌的地址写入项目其他文件，也不要在输出中完整展示令牌。
