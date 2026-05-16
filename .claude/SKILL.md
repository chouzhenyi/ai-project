# SKILL: 现代化 React 企业级表单/表格组件项目搭建

## 目的

快速搭建基于 React 19 + 企业级 UI 库 + 现代工具链的表单/表格演示项目，包含完整的技术选型、项目结构、开发环境配置。

## 适用场景

- 从零开始构建现代化 React 企业应用
- 升级现有 React 17 项目到 React 19
- 建立企业设计系统的技术基础
- 学习最新 React 生态最佳实践

## 工作流程

### 第一步：技术方案确认 (~10分钟)

1. **UI 库选择**
   - 选项 A：Ant Design v5/v6（推荐企业）- 完整、社区大、国内友好
   - 选项 B：shadcn/ui + Radix UI（推荐定制） - 灵活、现代、轻量
   - 选项 C：@alifd/next v3+ - 保留现有经验、高端设计
   - 选项 D：Mantine v8 - 开箱即用、学习成本低

2. **核心工具链确认**
   - React 19.x
   - TypeScript 5.6+
   - Vite 5/6
   - React Router v7
   - TanStack Query v5
   - React Hook Form v7
   - Zod（或 Valibot）
   - Zustand 或 Jotai
   - TailwindCSS v4（或保留 Less）
   - Vitest（单元测试）

3. **关键决策**
   - 样式系统：TailwindCSS（现代）vs Less（熟悉）
   - 状态管理：Zustand（轻量）vs Redux Toolkit（全能）
   - 数据流：TanStack Query + 本地状态 vs 全局 store
   - 构建目标：快速演示 vs 生产就绪 vs 设计系统

### 第二步：项目初始化 (~15分钟)

```bash
# 使用 Vite 官方模板
npm create vite@latest my-enterprise-ui -- --template react-ts

cd my-enterprise-ui

# 或使用 create-react-app（可选）
# npx create-react-app my-enterprise-ui --template typescript
```

### 第三步：核心依赖安装 (~5分钟)

**根据 UI 库选择安装对应依赖**

#### A. Ant Design 方案

```bash
pnpm add antd
pnpm add -D @ant-design/icons
```

#### B. shadcn/ui + Radix 方案

```bash
pnpm add @radix-ui/themes @radix-ui/react-dialog @radix-ui/react-form
pnpm add -D shadcn-ui  # 官方 CLI 工具
npx shadcn-ui@latest init  # 初始化 UI 库
```

#### C. Mantine 方案

```bash
pnpm add @mantine/core @mantine/hooks @mantine/form
```

**通用依赖**

```bash
# 路由
pnpm add react-router-dom

# 数据获取 & 缓存
pnpm add @tanstack/react-query

# 表单处理
pnpm add react-hook-form zod @hookform/resolvers

# 状态管理（选一个）
pnpm add zustand  # 或
pnpm add jotai

# 样式（如选择 TailwindCSS）
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 工具
pnpm add clsx class-variance-authority
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

### 第四步：项目结构搭建 (~10分钟)

```
src/
├── components/
│   ├── EasyTable.tsx          # 自定义表格组件
│   ├── EasyForm.tsx           # 自定义表单组件
│   ├── SvgIcon.tsx
│   └── ui/                    # UI 库基础组件（如 shadcn）
├── hooks/
│   ├── useTable.ts            # 表格数据/状态逻辑
│   ├── useForm.ts             # 表单逻辑包装
│   └── useAsync.ts
├── services/
│   ├── api.ts                 # TanStack Query queries
│   └── mutations.ts           # 变更操作
├── store/
│   └── index.ts               # Zustand store（可选）
├── types/
│   ├── table.ts
│   ├── form.ts
│   └── index.ts
├── views/
│   ├── Home.tsx
│   ├── TableDemo.tsx
│   ├── FormDemo.tsx
│   └── About.tsx
├── router/
│   └── index.tsx              # React Router v7
├── styles/
│   └── globals.css            # TailwindCSS 全局样式
├── assets/
│   └── icons/
└── main.tsx
```

### 第五步：配置文件设置 (~15分钟)

**vite.config.ts** - 路径别名 + 插件

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@views": path.resolve(__dirname, "./src/views"),
    },
  },
});
```

**tsconfig.json** - TypeScript 路径映射

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@services/*": ["./src/services/*"],
      "@store/*": ["./src/store/*"],
      "@types/*": ["./src/types/*"],
      "@views/*": ["./src/views/*"]
    }
  }
}
```

**tailwind.config.ts**（如使用 TailwindCSS）

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**vitest.config.ts**（单元测试）

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 第六步：核心组件实现 (~2小时)

#### EasyTable 核心架构

```typescript
// components/EasyTable.tsx
import React, { forwardRef, useImperativeHandle } from 'react'
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { Table as AntTable } from 'antd'  // 或其他 UI 库

interface EasyTableProps {
  columns: any[]
  data: any[]
  onEdit?: (record: any) => void
  pagination?: boolean
  editable?: 'row' | 'cell'
}

export const EasyTable = forwardRef((props: EasyTableProps, ref) => {
  // TanStack Table + TanStack Query 集成
  // 支持编辑、选择、CRUD 操作

  useImperativeHandle(ref, () => ({
    // 暴露 API
    refresh: () => { /* */ },
    getSelectedRows: () => { /* */ },
  }))

  return (
    // 表格 JSX
  )
})
```

#### EasyForm 核心架构

```typescript
// components/EasyForm.tsx
import React, { forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface EasyFormProps {
  schema: z.ZodSchema
  fields: FieldConfig[]
  onSubmit: (data: any) => void
}

export const EasyForm = forwardRef((props: EasyFormProps, ref) => {
  // React Hook Form + Zod 集成
  // 支持 17 种字段类型
  // 支持动态可见性/禁用

  return (
    // 表单 JSX
  )
})
```

### 第七步：路由配置 (~10分钟)

```typescript
// router/index.tsx
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: () => import("@views/Layout"),
    children: [
      {
        index: true,
        lazy: () => import("@views/Home"),
      },
      {
        path: "table",
        lazy: () => import("@views/TableDemo"),
        loader: async () => {
          // TanStack Query prefetch
        },
      },
      {
        path: "form",
        lazy: () => import("@views/FormDemo"),
      },
    ],
  },
]);
```

### 第八步：开发环境启动 (~5分钟)

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行类型检查
pnpm tsc --noEmit

# 运行单元测试
pnpm vitest

# 构建生产版本
pnpm build
```

### 第九步：性能优化验证 (~15分钟)

- [ ] 验证 Code Splitting（路由懒加载）
- [ ] 检查 Bundle 大小（Vite Analyzer）
- [ ] 验证 Lighthouse 评分（移动端 > 90）
- [ ] 测试 React DevTools Profiler（渲染性能）
- [ ] 运行 Lighthouse CI

### 第十步：文档和部署 (~20分钟)

1. **README 编写**
   - 项目概述
   - 快速开始
   - API 文档（EasyTable/EasyForm）
   - 贡献指南

2. **部署配置**
   - Vercel / Netlify：零配置部署
   - Docker：容器化部署
   - GitHub Pages：静态站点

## 关键决策树

```
├─ UI 库选择？
│  ├─ Ant Design (快速落地 + 国内支持)
│  ├─ shadcn/ui (高度定制 + 现代)
│  ├─ Mantine (开箱即用 + 简洁)
│  └─ @alifd/next (保持现有经验)
│
├─ 样式系统？
│  ├─ TailwindCSS (现代、按需生成)
│  └─ Less (熟悉、保守)
│
├─ 状态管理？
│  ├─ Zustand (轻量、足够)
│  ├─ Redux Toolkit (全能、复杂)
│  └─ Jotai (原子化、实验性)
│
└─ 部署目标？
   ├─ 演示项目 (Vercel/Netlify)
   ├─ 企业应用 (自托管 Docker)
   └─ 设计系统 (Storybook + Chromatic)
```

## 常见问题与解决方案

| 问题                        | 解决方案                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| **国内网络慢**              | 使用 pnpm + cnpm 镜像，或阿里云 npm 源                           |
| **TypeScript 类型错误**     | `pnpm tsc --noEmit` 检查，更新 @types/\* 依赖                    |
| **组件导入路径错误**        | 检查 vite.config.ts 和 tsconfig.json 路径别名配置                |
| **TanStack Query 缓存问题** | 调整 `staleTime` 和 `cacheTime` 参数                             |
| **Ant Design 样式冲突**     | 使用 ConfigProvider 统一主题配置                                 |
| **包体积过大**              | 启用 Tree-shaking，分析 node_modules（`vite-plugin-visualizer`） |

## 验收标准

✅ **开发环境**

- 本地 `pnpm dev` 成功启动
- TypeScript 无错误
- ESLint 检查通过

✅ **基础功能**

- 至少实现 1 个 EasyTable 演示（支持编辑）
- 至少实现 1 个 EasyForm 演示（支持验证）
- 路由正常切换
- 响应式设计合格

✅ **性能指标**

- Lighthouse 移动端得分 > 90
- 首屏加载时间 < 2s
- 单个页面包体积 < 200KB

✅ **代码质量**

- TypeScript 类型覆盖 > 80%
- 关键组件有单元测试
- 代码注释清晰

## 时间估算

- 方案确认：10 分钟
- 项目初始化：15 分钟
- 依赖安装：5 分钟
- 配置文件：15 分钟
- 组件实现：2-3 小时（取决于功能复杂度）
- 优化验证：15 分钟
- 文档部署：20 分钟

**总计：3.5-4.5 小时**（包含学习和调试）

## 相关资源

- [Ant Design 官方文档](https://ant.design/components/overview-cn/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [React Router v7](https://reactrouter.com/en/main)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod 验证库](https://zod.dev/)
- [TailwindCSS v4](https://tailwindcss.com/docs/v4)
- [Vite 官方文档](https://vitejs.dev/)

## 扩展方向

- 🎨 **设计系统**：建立 Storybook + 组件文档
- 📊 **数据可视化**：集成 ECharts / Recharts
- 🌐 **国际化**：集成 i18n 支持多语言
- 🎯 **分析监控**：集成 Sentry / DataDog
- 🔐 **权限系统**：RBAC / ABAC 权限控制
- 📱 **App 打包**：Tauri / Electron 桌面应用
