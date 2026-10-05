# 课程托管配置

线上网站：https://comp4020-final-2513238602.fly.dev/

应用固定为 `comp4020-final-2513238602`，属于课程组织。无需注册个人
Fly 账户、运行 `fly launch`、新建应用或绑定银行卡。

## 已配置

- `mise.toml` 固定 Node 24.21.0、pnpm 11.9.0、Fly CLI 0.4.111。
- final 专属 token 在本机 `mise.local.toml`，由 mise 注入环境变量。
  文件受 `.gitignore` 与 `.dockerignore` 双重排除；不复制到 GitHub。
- `Dockerfile` 在 Fly 远程构建；本机无需 Docker。
- `fly.toml` 保留课程资源配置：悉尼单机、shared CPU 1 核、256MB 内存、
  一个 1GB 卷挂载 `/data`、共享 IPv4、HTTPS 和闲置自动停止。
- GitHub 已有课程预设的 `FLY_API_TOKEN` secret。只确认其存在，未改写。
- 原课程 CI 工作流保持不变：私有阶段手动部署；公开后 main 推送通过
  检查才部署。没有提前公开仓库或触发 ship。

## 更新网站

在本仓库 PowerShell 中运行，保留 `mise exec --` 前缀：

```powershell
mise install
mise exec -- flyctl config validate -a comp4020-final-2513238602
mise exec -- flyctl deploy --remote-only --ha=false -a comp4020-final-2513238602
```

部署之前先按 LOCAL_RUN.md 运行测试。不要添加第二台机器、额外卷、
专用 IPv4 或扩大内存。数据库只保存在 `/data`；本地测试数据不会上传。

## 检查和日志

```powershell
mise exec -- flyctl status -a comp4020-final-2513238602
mise exec -- flyctl logs --no-tail -a comp4020-final-2513238602
mise exec -- flyctl machines list -a comp4020-final-2513238602
mise exec -- flyctl volumes list -a comp4020-final-2513238602
mise exec -- flyctl ips list -a comp4020-final-2513238602
```

课程配置未单独定义健康检查；应结合网站 `/health`、根页面及 `/readme/`
的 HTTP 响应确认服务正常。闲置停止属于正常行为，下次访问自动启动。
token 学期末失效，失效时回复原 Ed 私信申请更新；不要注册新 Fly 账户。

## 持久化复验

```powershell
mise exec -- node scripts/check-hosted-persistence.mjs seed
# 重启现有机器或按上文重新部署后：
mise exec -- node scripts/check-hosted-persistence.mjs verify
```

脚本创建一条专用测试调查，将恢复它所需的会话保存在被忽略的
`evidence/hosted-persistence.json`。不要提交这个文件。

## 课程提交仍需单独完成

这份配置完成托管接入，不代表 C8 或期末整体已提交。真人试玩、个人
反思，以及课程截止时的 `/comp4020:ship` 是后续事项。不能用 CLI
部署成功代替这些要求。历史本地验收记录保留原有日期和边界。

来源：[课程 hosting-access](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/hosting-access/)。
