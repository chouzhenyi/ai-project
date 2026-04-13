---
name: react-vite-next-ultimate-skill
description: 基于 Vite、React 18、TypeScript、Redux、React Router 和 @alifd/next 创建全配置企业级 React 应用。包含路由懒加载、构建优化、代码规范、Git 提交钩子、SVG 图标及环境变量配置。
version: 4.0.0
---

# React + Vite + TypeScript + Next 企业级终极项目创建技能

## 技能目标

本技能旨在创建一个生产就绪（Production-Ready）且具备高度自动化规范的企业级 React 项目脚手架。它集成了核心业务库、完整的工程化配置（性能优化、代码规范、Git 钩子、SVG 图标、环境变量），确保项目从第一天起就具备高性能、可维护性和团队协作规范性。

## 执行流程

1.  **初始化与依赖安装**
    使用 Vite 创建 React TypeScript 项目，并安装所有必要的业务与开发依赖。

    ```bash
    # 1. 创建项目
    pnpm create vite@latest my-enterprise-app -- --template react-ts

    cd my-enterprise-app

    # 2. 安装核心业务库 (Redux, Router, Next UI, Less)
    pnpm install react-router-dom@6 @reduxjs/toolkit react-redux @alifd/next moment
    pnpm install -D less @types/less

    # 3. 安装工程化与规范工具
    # Eslint & Prettier
    pnpm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks @eslint/js typescript-eslint

    # Git Hooks & Commit Lint
    pnpm install -D husky @commitlint/cli @commitlint/config-conventional

    # Vite Plugins (Compression, SVG)
    pnpm install -D vite-plugin-compression terser vite-plugin-svg-icons
    ```

2.  **核心配置文件生成**
    创建或修改以下关键配置文件，以实现工程化闭环。

    #### A. Vite 构建与插件配置 (`vite.config.ts`)

    配置路径别名、Gzip 压缩、代码分割、SVG 雪碧图及生产环境移除 Console。

    ```typescript
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import viteCompression from "vite-plugin-compression";
    import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
    import path from "path";

    export default defineConfig({
      plugins: [
        react({ jsxRuntime: "automatic" }),
        // Gzip 压缩
        viteCompression({ algorithm: "gzip" }),
        // SVG 雪碧图
        createSvgIconsPlugin({
          iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
          symbolId: "icon-[dir]-[name]",
        }),
      ],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
          "@components": path.resolve(__dirname, "./src/components"),
          "@assets": path.resolve(__dirname, "./src/assets"),
        },
      },
      css: {
        preprocessorOptions: {
          less: { javascriptEnabled: true },
        },
      },
      optimizeDeps: { include: ["@alifd/next", "moment"] },
      build: {
        minify: "terser",
        terserOptions: {
          compress: { drop_console: true, drop_debugger: true },
        },
        rollupOptions: {
          output: {
            manualChunks: {
              "react-vendor": ["react", "react-dom", "react-router-dom"],
              "next-vendor": ["@alifd/next"],
            },
          },
        },
      },
    });
    ```

    #### B. ESLint 与 Prettier 配置

    配置 ESLint 9 Flat Config 以适配 TS 和 React 18，并统一代码风格为双引号（适配 Next 组件库）。

    **prettier.config.js**

    ```javascript
    export default {
      printWidth: 100,
      semi: true,
      singleQuote: false,
      trailingComma: "all",
    };
    ```

    **eslint.config.js**

    ```javascript
    import js from "@eslint/js";
    import tseslint from "typescript-eslint";
    import react from "eslint-plugin-react";
    import prettierConfig from "eslint-config-prettier";

    export default tseslint.config(
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      prettierConfig,
      {
        rules: {
          "react/react-in-jsx-scope": "off",
          "prettier/prettier": "error",
        },
      },
    );
    ```

    #### C. Git 提交规范配置

    **commitlint.config.cjs**

    ```javascript
    module.exports = {
      extends: ["@commitlint/config-conventional"],
      rules: {
        "type-enum": [
          2,
          "always",
          ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "revert"],
        ],
      },
    };
    ```

    **package.json (Scripts & Config)**

    ```json
    {
      "scripts": {
        "prepare": "husky install",
        "commit": "cz"
      },
      "config": {
        "commitizen": {
          "path": "cz-conventional-changelog"
        }
      }
    }
    ```

    _(注：需手动运行 `npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'` 等命令初始化钩子)_

    #### D. 环境变量 (` .env.production` & `src/types/env.d.ts`)

    区分环境配置并添加 TS 类型提示。

    ```bash
    # .env.production
    VITE_API_BASE_URL=https://api.example.com
    VITE_APP_TITLE=Enterprise App
    ```

    ```typescript
    // src/types/env.d.ts
    interface ImportMetaEnv {
      readonly VITE_API_BASE_URL: string;
    }
    interface ImportMeta {
      readonly env: ImportMetaEnv;
    }
    ```

3.  **业务代码实现**

    #### A. 路由懒加载 (`src/router/index.tsx`)

    使用 `React.lazy` 和 `Suspense` 实现路由级别的代码分割。

    ```tsx
    import { createBrowserRouter, RouterProvider } from "react-router-dom";
    import React, { Suspense } from "react";

    const HomeLazy = React.lazy(() => import("@/views/Home"));
    const AboutLazy = React.lazy(() => import("@/views/About"));

    const router = createBrowserRouter([
      {
        path: "/",
        element: <div>Layout</div>,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <HomeLazy />
              </Suspense>
            ),
          },
          {
            path: "about",
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <AboutLazy />
              </Suspense>
            ),
          },
        ],
      },
    ]);
    export default router;
    ```

    #### B. SVG 图标组件 (`src/components/SvgIcon.tsx`)

    封装通用图标组件以使用雪碧图。

    ```tsx
    import React, { CSSProperties } from "react";

    interface SvgIconProps {
      name: string;
      prefix?: string;
      color?: string;
      size?: string | number;
      style?: CSSProperties;
    }

    const SvgIcon: React.FC<SvgIconProps> = ({
      name,
      prefix = "icon",
      color = "currentColor",
      size = "1em",
      style,
    }) => {
      const symbolId = `#${prefix}-${name}`;
      return (
        <svg aria-hidden="true" style={{ width: size, height: size, fill: color, ...style }}>
          <use href={symbolId} />
        </svg>
      );
    };
    export default SvgIcon;
    ```

    #### C. 入口文件整合 (`src/main.tsx`)

    引入虚拟 SVG 模块和全局样式。

    ```tsx
    import React from "react";
    import ReactDOM from "react-dom/client";
    import { Provider } from "react-redux";
    import { BrowserRouter } from "react-router-dom";
    import { store } from "./store";
    import App from "./App.tsx";

    // 注册 SVG 雪碧图
    import "virtual:svg-icons-register";
    import "@alifd/next/dist/next.css";

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>,
    );
    ```

## 版本规范

- **Vite**: `^6.0.0`
- **React**: `^18.0.0`
- **TypeScript**: `^5.0.0`
- **@alifd/next**: `latest`
- **Redux Toolkit**: `latest`
- **React Router**: `^6.0.0`

## 输出示例

项目创建后，`dist` 目录结构应包含：

- `assets/`
  - `index-[hash].js` (核心业务代码)
  - `react-vendor-[hash].js` (React 核心库)
  - `next-vendor-[hash].js` (UI 组件库)
  - `Home-[hash].js` (懒加载页面)
  - `index-[hash].js.gz` (Gzip 压缩文件)
