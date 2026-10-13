# 本地试玩与课程边界

项目：Lost & Found / 失物档案。现已部署到课程分配的 Fly 应用；
GitHub 仓库已公开，main 推送经 CI 检查后部署。线上地址：https://comp4020-final-2513238602.fly.dev/
下方为本地运行方法；部署操作见 [HOSTING.md](HOSTING.md)。

## 启动

在本仓库打开 PowerShell，使用 mise.toml 指定的 Node 24.21 与 pnpm 11.9：

```powershell
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm build
mise exec -- pnpm start
```

打开 http://localhost:8080 。停止服务用 Ctrl+C。修改前端后重新执行
`pnpm build`；修改服务端后重启。`pnpm dev` 当前也是服务端启动命令，
没有热更新。默认数据库在 `data/lost-found.sqlite`，重启保留进度。

## 试玩

- 单人：Open the case → 输入昵称 → Go solo → Begin investigation。
- 双人同机：选择 Bring a partner，在 Invite your partner 中复制链接，
  用另一个浏览器或独立无痕窗口打开。两人需要不同的 cookie 会话。
- localhost 链接只能在这台电脑使用。跨设备试玩请使用线上网站生成邀请。
- 阅读线索后用 Add to shared desk 发布；调整右侧事件顺序；用
  Make your case 提交解释并引用两种文件夹的证据。
- 不看 server/case.ts 或 docs/case-design.md，其中有剧透答案。

## 测试

建议另开一个 PowerShell 窗口启动独立测试服务，避免测试案件混入试玩：

```powershell
$env:PORT = '8082'
$env:DATA_DIR = './data/qa'
mise exec -- pnpm start
```

在第三个窗口运行：

```powershell
$env:APP_URL = 'http://localhost:8082'
mise exec -- pnpm check
mise exec -- pnpm check:browser
mise exec -- pnpm check:collaboration
mise exec -- pnpm check:resilience
mise exec -- pnpm check:evidence
```

浏览器脚本默认使用 Microsoft Edge。Linux CI 会安装 Chromium，并设置
`BROWSER_CHANNEL=chromium`。输出在 evidence/，截图和原始会话不提交。
服务端测试包括双人完整记录在重启后恢复；浏览器测试包括实时协作、
断网补回线索、保存回执丢失及冲突恢复失败。CI 在部署前运行全部三组浏览器检查。

## 提交前尚需完成

技术实现及验证见 [final-readiness](docs/final-readiness.md)。真实双人试玩、
C10 课堂中看日志讲述他人操作、个人反思以及研究笔记的个人立场仍需学生完成。
准备材料已提供，但不能把草稿或自动测试当成亲身经历。

同一个 final 仓库用于 C8–C10 和期末；C7 RoomFlow 是另一份旧作业。
不要因为本地已包含双人基础功能就声称 C9/C10 或期末全部达标。
