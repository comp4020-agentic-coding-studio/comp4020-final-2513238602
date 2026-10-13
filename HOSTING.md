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
- 课程 CI 的部署门槛和资源限制保留；在原有检查之外加入桌面、手机、
  协作及弱网浏览器测试。仓库已公开，main 推送通过所有检查后部署。

## 更新网站

先按 LOCAL_RUN.md 完成本地检查，再提交并推送 main：

```powershell
git push origin main
gh run list --limit 1
gh run watch <run-id> --exit-status
```

仓库公开之后由 CI 部署；不要用手动部署绕过检查。首次私有阶段的部署记录
保留在 docs/hosting-verification.md。不要添加第二台机器、额外卷、
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
mise exec -- node scripts/check-hosted-persistence.mjs verify
```

本机已有原始验证调查，直接 verify，不能重新 seed 后声称旧数据仍在。
仅首次设置新验证环境时使用 seed。恢复所需会话在被忽略的
`evidence/hosted-persistence.json`；不要提交。脱敏结果写入
`evidence/persistence-results.json`，包含真实创建／验证日期，不含 cookie。

## 课程提交仍需单独完成

这份配置完成托管接入，不代表 C8 或期末全部要求已完成。个人反思
需依据学生的真实经历，研究笔记草稿需学生核对，真人试玩尚待进行。
公开发布使用课程 ship 流程检查、CI 部署和 crit 标签，不能用 CLI
部署成功代替这些要求。历史本地验收记录保留原有日期和边界。

来源：[课程 hosting-access](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/hosting-access/)。
