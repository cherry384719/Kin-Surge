# 通天路 (Tongtian Lu)

**穿越千年，与诗人对话** — 一款面向中小学生的古诗词游戏化学习平台。

## 项目简介

通天路是由 Kin Surge 团队开发的互动式古诗词学习平台。平台将部编版语文教材中的古诗词内容，通过朝代探索和诗人 1v1 挑战的方式进行游戏化呈现，让学生在趣味互动中掌握经典诗词。

**目标用户：** 6-15 岁中小学生及其家长、教师

## 功能特性

### 朝代探索
- 6 个历史朝代：汉 → 魏晋 → 唐 → 宋 → 元 → 明清
- 26 位历史诗人（20 位常规 + 6 位 Boss）
- 渐进式解锁：通关前一朝代的 Boss 解锁下一朝代

### 多题型挑战
- **选择题** — 从 4 个选项中选出正确的下一句（初级）
- **填空题** — 手动输入下一句，支持繁简体和模糊匹配（中级）
- **排序题** — 将打乱的诗句排列成正确顺序（高级）
- **飞花令** — 与 AI 轮流说出包含指定字的诗句（特殊模式）

### 游戏化系统
- 金币奖励（每题 10 币，每日奖励 50 币）
- 连续签到系统
- 星级评定（0-3 星）
- 朝代主题背景和音效

### 诗词数据库
- 90+ 首经典诗词，覆盖小学到高中课程标准
- 诗人开场对白，增强沉浸感
- 每首诗拆分为独立诗句，支持多种题型

## 技术栈

| 层 | 技术 |
|---|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 7 |
| 样式 | Tailwind CSS v3 |
| 后端 / 数据库 | Supabase (Auth + PostgreSQL) |
| 测试 | Vitest + React Testing Library |
| 部署 | Vercel |

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 填入 Supabase 项目的 URL 和 Anon Key：
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# 启动开发服务器
npm run dev

# 运行测试
npm run test:run

# 生产构建
npm run build
```

## 项目结构

```
src/
├── features/
│   ├── auth/          # 登录注册、路由守卫
│   ├── poetry/        # 挑战系统（选择/填空/排序/飞花令）
│   ├── scenes/        # 朝代地图、诗人列表
│   ├── progress/      # 进度追踪、解锁逻辑
│   ├── gamification/  # 金币、连续签到、体力
│   ├── layout/        # HUD、背景特效
│   ├── theme/         # 主题切换、朝代配色
│   └── audio/         # 音效系统
├── lib/
│   └── supabase.ts    # Supabase 客户端
└── App.tsx            # 路由配置

supabase/migrations/   # 数据库迁移文件（7 个）
```

## 数据库迁移

在 Supabase SQL Editor 中按顺序执行 `supabase/migrations/` 下的 SQL 文件：

1. `001_initial_schema.sql` — 基础表结构
2. `002_seed_data.sql` — 初始数据
3. `003_unlock_system.sql` — 解锁系统
4. `004_expanded_seed_data.sql` — 扩展诗词数据
5. `005_rls_user_progress.sql` — 行级安全策略
6. `006_challenge_intro.sql` — 诗人开场白
7. `007_more_poems.sql` — 额外 27 首诗词

## 测试

```bash
npm run test:run    # 单次运行（58 个测试，18 个文件）
npm run test        # 监听模式
```

## 团队

**Kin Surge**

## 许可

本项目为课程项目，仅供学习交流使用。
