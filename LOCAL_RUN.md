# 本地试玩与课程边界

项目：Lost & Found / 失物档案。现已部署到课程分配的 Fly 应用；
GitHub 仓库已公开，main 推送经 CI 检查后部署。
[打开线上应用](https://comp4020-final-2513238602.fly.dev/)。
下方为本地运行方法；部署操作见 [HOSTING.md](HOSTING.md)。

## 启动

在本仓库打开 PowerShell，使用 mise.toml 指定的 Node 24.21 与 pnpm 11.9：

```powershell
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm build
mise exec -- pnpm start
```

打开 [本地应用](http://localhost:8080)。停止服务用 Ctrl+C。修改前端后重新执行
`pnpm build`；修改服务端后重启。`pnpm dev` 当前也是服务端启动命令，
没有热更新。默认数据库在 `data/lost-found.sqlite`，重启保留进度。

## 试玩

- 主案：Play After Hours → 输入昵称 → Start After Hours → Team & invite 复制邀请，供另外 1–3 位玩家加入。
- 主案每人使用独立浏览器或设备。选中物件、执行检查、Share this evidence，再到 Reason together 引用实际支持的证据。四个房间分三幕开放。
- Team & invite 可明确转交职责；某人离开后，其他人仍能继续。对象列表提供和 3D 一样的调查操作。
- 经典短案单人：Open the case → 输入昵称 → Go solo → Begin investigation。
- 双人同机：选择 Bring a partner，在 Invite your partner 中复制链接，
  用另一个 Chrome 用户配置或另一款浏览器打开。普通窗口与无痕窗口也可以；
  同一配置下的两个无痕窗口可能共用会话，不能当成两个身份。
- localhost 链接只能在这台电脑使用。跨设备试玩请使用线上网站生成邀请。
- 阅读线索后用 Add to shared desk 发布；调整右侧事件顺序；用
  Make your case 提交解释并引用两种文件夹的证据。
- 主案剧透在 server/after-hours-case.ts 和 docs/after-hours-design.md；短案剧透在 server/case.ts 和 docs/case-design.md。首次试玩前不要读。

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
mise exec -- pnpm check:returning
mise exec -- pnpm check:entry
mise exec -- pnpm check:theory
mise exec -- pnpm check:motion
mise exec -- pnpm check:after-hours
mise exec -- pnpm check:after-hours-party
mise exec -- pnpm check:after-hours-recovery
mise exec -- pnpm check:evidence
mise exec -- pnpm check:portfolio
```

浏览器脚本默认使用 Microsoft Edge。Linux CI 会安装 Chromium，并设置
`BROWSER_CHANNEL=chromium`。输出在被忽略的 `evidence/`；原始会话不提交。
需要公开的脱敏结果和截图，经检查后单独放入 `docs/`。
七组既有浏览器检查分别覆盖完整试玩与两种视口、双人实时协作、调查中的网络恢复、
返回首页找回旧调查、创建或加入时丢失保存回执、缺证据时的提交引导和草稿保留，
以及确认后的共享动效、连续排序、减少动态和结案去重。`check:motion` 的结果与截图
默认在忽略的 `data/motion/`，可用 `MOTION_OUTPUT_DIR` 改变位置。
`check` 另含真实 HTTP、进程重启和日志检查。三组新主案检查覆盖完整双人通关、四人分工及断线交接、保存回执丢失及真实 WebGL 故障，结果默认在忽略的 data/after-hours-*。
CI 配置在部署前运行共十一组浏览器检查及两个材料检查；
当前运行结果以 CI 和 [验收记录](docs/final-readiness.md) 为准。

上面的 `APP_URL` 让 `check:returning` 复用已启动的测试服务，不主动重启它。
若要单独验证浏览器在服务重启后找回旧调查，先完成构建，再在新窗口运行：

```powershell
$env:APP_URL = $null
mise exec -- pnpm check:returning
```

未设置 `APP_URL` 时，只有 `check:returning` 会自行创建隔离服务和临时数据库，
保存测试调查后重启服务，结束时关闭并清理。其他浏览器命令仍需已运行的服务。
测试会创建调查；请使用独立测试数据，不要把测试案件混入自己的试玩记录。

`check:evidence` 保留课程的每周材料检查；`check:portfolio` 额外检查 final 的
全部三份反思、必需文档、本地链接和提交引用。字数提示是指导，检查通过不表示
个人论点、真人体验或研究判断已经获得确认。

## 四人自动模拟留痕

评分环境专项检查：`mise exec -- pnpm check:after-hours-marking`。默认使用已安装的
Chrome；可设置 `BROWSER_CHANNEL=chromium` 使用 Playwright 浏览器，CI 使用后者。
从 `/readme/` 发现入口，模拟 3D 延迟、保存途中缩放、草稿同步与限速重连。
`APP_URL` 指定隔离本地服务或课程线上；每次创建自己的测试案。结果、浏览器版本、
脚本摘要及截图写入新的 `data/marking-*`，也可用 `MARKING_OUTPUT` 指定尚不存在的
data/ 子目录。不输出 cookie 或原始 trace。见 [10 月 25 日记录](docs/verification/2026-10-25/README.md)。

按需运行四人留痕模拟（不是额外的 CI 套件，也不是真人试玩）：

```powershell
$env:APP_URL = 'https://comp4020-final-2513238602.fly.dev'
mise exec -- pnpm check:simulation
```

每次创建独立测试案，执行 63 个步骤并将时间戳日志、截图、服务端操作投影和
四份浏览器 trace 保存到新的 `data/player-simulation-*`。答案在脚本中预先给定；
执行耗时不能作为人类通关时长。`SIM_OUTPUT` 可指定新的 data/ 子目录，已有结果
不会被覆盖。原始 trace 含浏览器会话信息，只保留在被忽略的本地 data/，不要公开。
可用 `mise exec -- pnpm exec playwright show-trace <本地 trace.zip 路径>` 查看。
[2026-10-22 模拟报告](docs/simulations/2026-10-22/README.md) 区分模拟结果、截图发现、
脚本错误、修复前失败与修复后验证。

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

## Final 准备状态与本人审阅

代码、过程总览、三份反思和 COMP8020 研究稿均已准备为可审阅材料：
[C8 反思](reflections/crit-8.md)、[C9 反思](reflections/crit-9.md)、
[C10 反思](reflections/crit-10.md)、[研究稿](research-note.md)。
反思披露代理协助，依据真实指示和开发记录；C8/C9 明确是 10 月 18 日补写，
不改变过去截止状态。最新技术验收与剩余边界见
[final-readiness](docs/final-readiness.md)，C10 既有记录见
[C10 验证](docs/c10-verification.md)。

本人需要审阅论点、阅读拟保留的研究来源，并如实核实过去的 C10 课堂经历。
主案建议找两至三组首次玩家（包括双人和三至四人）试玩，使用真实手机。
人数与 30–45 分钟安排是验证方法，不构成额外课程要求。[本人参与清单](docs/final-personal-review.md) 区分了
正式要求和建议方法。后续观察须如实补记，不移动已过截止时间的标签。

同一个 final 仓库用于 C8–C10 和期末；C7 RoomFlow 是另一份旧作业。
Final 截止为 11 月 9 日中午（悉尼）。材料完整和技术检查通过，不能代替
尚未核实的课堂参与或未记录的真人评价，也不能据此声称期末所有工作已经完成。
