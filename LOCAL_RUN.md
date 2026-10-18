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
  用另一个 Chrome 用户配置或另一款浏览器打开。普通窗口与无痕窗口也可以；
  同一配置下的两个无痕窗口可能共用会话，不能当成两个身份。
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

## C10 课堂操作

课前在本仓库打开 PowerShell，先运行：

```powershell
mise exec -- flyctl logs --json -a comp4020-final-2513238602 | mise exec -- node scripts/format-room-logs.mjs
```

只把线上网址给两位同学，让他们按页面完成开始、邀请与加入。你看终端，
不操作自己的网页。用 room 区分案件，用 role 和 member 区分两人。
`COMMITTED` 是已保存的操作；`REJECTED` 是拒绝，不能讲成保存成功。
`published` 后面是哪条线索，`arranged` 后面是保存的新顺序。
日志可能稍后才出现，空白不等于没有操作。原始日志备用命令和完整步骤见
[C10 课堂指南](docs/crit-10-rehearsal.md)。

## 提交状态与尚需完成

本轮 C10 的技术实现、课前反思和过程说明已完成，验证记录见
[C10 验证](docs/c10-verification.md)。反思已说明代理协助写作，依据真实开发
记录，没有编写未发生的课堂体验。Liuru 截止为 10 月 21 日 13:30（悉尼）。

真实双人试玩、课堂日志讲述，以及期末研究笔记和其余个人材料的审阅仍需
完成；详见 [final-readiness](docs/final-readiness.md)。课堂观察可以之后补充，
不移动已过截止时间的标签，也不把自动测试当成亲身经历。

同一个 final 仓库用于 C8–C10 和期末；C7 RoomFlow 是另一份旧作业。
不要因为本地已包含双人基础功能就声称 C9/C10 或期末全部达标。
