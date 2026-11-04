---
name: commit-push-github
description: 提交项目并推送到 GitHub 仓库（maxinyuzi/mxyz）。当用户要求"提交到github"、"push 到 github"、"提交/推送到 GitHub"时使用。
---

# 提交项目到 GitHub

将当前项目（c:\Users\31423\Desktop\新建文件夹）用 git 提交并推送到 GitHub 远程仓库，认证方式为 SSH 公钥（已在本机生成）。

## 仓库信息

- 仓库页面：`https://github.com/maxinyuzi/mxyz`
- SSH 推送地址（远程名固定用 `github`）：`git@github.com:maxinyuzi/mxyz.git`
- SSH 密钥：`C:\Users\31423\.ssh\id_ed25519`（公钥为同名 `.pub` 文件，注释 `ma-xinyu-zi gitee`）

## 执行步骤

1. 进入项目根目录 `c:\Users\31423\Desktop\新建文件夹`。
2. 若不存在 `.git` 目录，先执行 `git init -b main` 初始化仓库。
3. 检查提交身份：`git config user.name` 与 `git config user.email`。若未配置，先向用户询问邮箱，再用 `git config --local user.name "maxinyuzi"` 与 `git config --local user.email "<用户邮箱>"` 设置（仅对本仓库生效，不改全局配置）。
4. SSH 连通性预检：执行 `ssh -o StrictHostKeyChecking=accept-new -T git@github.com`。
   - 返回 `Hi <用户名>! You've successfully authenticated` 即通过；
   - 返回 `Permission denied (publickey)`：说明本机公钥尚未添加到 GitHub 账户——读取 `C:\Users\31423\.ssh\id_ed25519.pub` 内容展示给用户，指引用户到 GitHub「Settings → SSH and GPG keys → New SSH key」粘贴添加，确认后再继续（不要跳过此步骤直接推送）。
5. 运行 `git status` 与 `git diff` 查看变更内容。提交前确认不包含敏感文件（.env、令牌文件、SSH 私钥等）；如发现敏感文件，排除并向用户说明。
6. 暂存变更：优先 `git add <具体文件>`；文件数量多时可用 `git add -A`，但必须先完成第 5 步检查。
7. 提交：`git commit -m "<简洁中文描述，一句概括本次提交的目的>"`。若无变更则不创建空提交，直接告知用户。
8. 配置远程：
   - 首次：`git remote add github git@github.com:maxinyuzi/mxyz.git`
   - 若远程 `github` 已存在但地址不对：`git remote set-url github git@github.com:maxinyuzi/mxyz.git`
9. 推送：首次执行 `git push -u github main`；之后执行 `git push github main`（若当前分支不是 main，推送当前分支并说明）。
10. 推送成功后运行 `git status` 确认工作区干净，并向用户报告：提交信息、推送分支、远程地址。

## 常见错误处理

- `Permission denied (publickey)`：公钥未添加到 GitHub 账户，或密钥口令问题——按第 4 步指引处理。
- 首次连接卡住等待确认 host key：改用 `ssh -o StrictHostKeyChecking=accept-new -T git@github.com` 先行确认，或手动把 github.com 加入 `~/.ssh/known_hosts`。
- 推送被拒绝（non-fast-forward）：先执行 `git pull --rebase github main`，解决冲突后再推送。
- 网络超时 / 连接重置：GitHub 访问可能不稳定，重试一次；仍失败则报告用户，不要反复重试。
- 远程仓库为空且默认分支为 master：以本地 `main` 为准直接推送即可。

## 注意事项

- 远程名用 `github`，与 Gitee 的远程名 `gitee`（见 SKILL/commit-push/SKILL.md）互不冲突，两个远程可共存。
- SSH 私钥 `id_ed25519` 绝不能提交进仓库或外传。
