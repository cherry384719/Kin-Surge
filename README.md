# Kin Surge / 通天路

一个重新架构后的古诗词学习项目：前端使用 React + Vite，后端使用 Go + Gin，存储落在本地 SQLite，并支持单容器演示和服务器 Docker 部署。

![image](https://cherry384719.github.io/picx-images-hosting/image.64eeu1b5zm.png)

## 当前范围

- 用户体系：用户名/邮箱登录、注册、游客试玩
- 核心主线：朝代总览 -> 诗人挑战 -> Boss 解锁 -> 下一朝代
- 挑战结构：选择题、填空题、排序题
- 进度系统：通关、星级、金币
- 内容维护：继续使用仓库内种子文件维护诗词内容

飞花令玩法已移除。

## 技术栈

### 前端

- React 19
- TypeScript
- Vite 7
- Tailwind CSS

### 后端

- Go 1.24
- Gin
- GORM
- SQLite
- JWT + HttpOnly Cookie

## 目录

```text
src/                     React 前端
server/                  Gin 后端
supabase/migrations/     现作为内容种子来源
Dockerfile               单容器构建
docker-compose.yml       本地 Demo Docker 运行
docker-compose.prod.yml  服务器部署栈（Caddy + App）
Caddyfile                反向代理与 HTTPS
```

## 本地开发

### 1. 启动后端

```bash
cd server
go mod tidy
go run ./cmd/api
```

默认监听 `http://localhost:8080`，数据库文件位于 `server/data/kinsurge.db`。

### 2. 启动前端

```bash
npm install
npm run dev
```

默认监听 `http://localhost:5173`，Vite 已代理 `/api` 到 `http://localhost:8080`。

## Docker Demo

```bash
docker compose up --build
```

启动后访问：

- `http://localhost:8080`

SQLite 数据会持久化到：

- `./docker-data/kinsurge.db`

## 服务器部署

### 1. 准备环境变量

```bash
cp .env.example .env
```

至少修改这些值：

- `APP_DOMAIN`
- `APP_EMAIL`
- `KIN_JWT_SECRET`
- `KIN_ALLOW_ORIGINS`

### 2. 启动生产栈

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

生产栈包含：

- `app`：Gin + SQLite + 前端静态文件
- `caddy`：反向代理、自动 HTTPS、压缩和基础响应头

### 3. 数据持久化

生产环境 SQLite 存放在 Docker volume：

- `kin_surge_data`

### 4. 服务器要求

- 80 和 443 端口可访问
- 域名已解析到服务器公网 IP
- 首次签发证书时服务器可正常访问 Let's Encrypt

### 5. 更新

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## 内容种子说明

项目会在数据库为空时自动导入诗词内容。当前内容来源：

- [004_expanded_seed_data.sql](/Users/szn/Desktop/Kin-Surge/supabase/migrations/004_expanded_seed_data.sql)
- [006_challenge_intro.sql](/Users/szn/Desktop/Kin-Surge/supabase/migrations/006_challenge_intro.sql)
- [007_more_poems.sql](/Users/szn/Desktop/Kin-Surge/supabase/migrations/007_more_poems.sql)

其中 `007_more_poems.sql` 中无法直接在 SQLite 执行的诗句拆分部分，会由后端在导入后自动补齐。

## 常用命令

```bash
npm run dev          # 前端开发
npm run build        # 前端构建
npm run test:run     # 仅运行新测试入口
npm run server:dev   # 后端开发
```
