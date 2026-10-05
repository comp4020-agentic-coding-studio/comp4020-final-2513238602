# 本地试玩与课程边界

项目：Lost & Found / 失物档案。当前仅本地运行，没有部署或推送。

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

- 单人：Open the case → 输入昵称 → Just me → Begin investigation。
- 双人同机：选择 Bring a partner，在 Invite your partner 中复制链接，
  用另一个浏览器或独立无痕窗口打开。两人需要不同的 cookie 会话。
- localhost 链接只能在这台电脑使用；尚未提供公共网络试玩地址。
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
mise exec -- pnpm check:evidence
```

浏览器脚本需要已安装 Microsoft Edge。输出在 evidence/。
服务端测试包括重启数据库恢复；浏览器测试包括断网后补回同伴线索。

## 提交前尚需完成

本地完成不等于课程已提交。Fly 凭据尚未配置；Docker 镜像和 Fly 持久卷
尚未实际验收。先做一次真实双人试玩，再由学生核实 README 的立场、
PROCESS 的过程描述，并亲自完成 reflections/crit-8.md 的个人反思。
COMP8020 期末研究写作及后续 crit 的增量要求仍需按对应 brief 完成。

同一个 final 仓库用于 C8–C10 和期末；C7 RoomFlow 是另一份旧作业。
不要因为本地已包含双人基础功能就声称 C9/C10 或期末全部达标。
