# 项目 Skills 和 Agents

## 可用的 Skills

### 1. React 企业级项目搭建

**触发词汇**：

- `/react-enterprise` - 搭建现代化 React 企业应用
- `/setup-react-project` - 初始化新的 React 项目
- `/new-ui-project` - 创建新的表单/表格组件项目

**说话方式示例**：

```
我想搭建一个现代化的 React 表单和表格组件项目
```

或

```
帮我用 React 19 + Ant Design 创建一个企业级应用
```

或

```
从零开始创建一个 React 项目，用最新的技术栈
```

**关键触发主题**：

- "搭建"、"创建"、"初始化" React 项目
- "React 19"、"Ant Design"、"表单"、"表格"
- "企业级"、"生产应用"
- "现代化"、"升级"、"迁移"
- "TailwindCSS"、"Hook Form"、"TanStack Query"

**Skill 文件**：`.claude/SKILL.md`

**适用场景**：

- ✅ 从零开始启动新项目
- ✅ 升级 React 17 到 React 19
- ✅ 需要完整的技术方案和配置
- ✅ 建立企业级 EasyTable/EasyForm 组件
- ✅ 学习现代 React 生态最佳实践

**不适用场景**：

- ❌ 仅修复小 bug
- ❌ 单个文件编辑
- ❌ 代码审查

---

## 快速命令参考

| 场景       | 最佳提示词                                           |
| ---------- | ---------------------------------------------------- |
| 项目初始化 | "帮我搭建一个 React 19 企业级项目"                   |
| 技术选型   | "React 企业应用用 Ant Design 还是 shadcn/ui 好？"    |
| 配置指导   | "帮我配置 Vite + TailwindCSS"                        |
| 组件实现   | "实现一个 Schema 驱动的表单组件"                     |
| 性能优化   | "我的 React 应用包体积太大，怎么优化？"              |
| 路由设置   | "用 React Router v7 + TanStack Query 怎么做懒加载？" |

---

## 使用流程

### 方式一：直接使用命令（推荐快速）

```
/react-enterprise
```

然后按照 Skill 的步骤一步步执行。

### 方式二：自然语言触发（推荐问题解决）

```
我想用 React 19 + Ant Design 搭建一个表单/表格演示系统，需要完整的方案
```

系统会自动识别并引导你使用相关的 Skill。

### 方式三：咨询后再执行

```
React 企业应用用 Ant Design 还是 shadcn/ui？
```

获得建议后，再启动 Skill 进行完整搭建。

---

## Skill 包含的关键决策点

**UI 库选择**：

- Ant Design v5/v6（👍 推荐企业）
- shadcn/ui + Radix UI（👍 推荐定制）
- Mantine v8
- @alifd/next v3+

**核心工具链**：

- React 19.x
- TypeScript 5.6+
- Vite 5/6
- React Router v7
- TanStack Query v5
- React Hook Form v7
- Zod 验证
- Zustand 状态管理

**关键配置**：

- 项目结构搭建
- 路径别名配置
- 构建优化设置
- 测试框架配置

---

## 常见提示词示例

### 场景 1：完整项目启动

```
我想用最新的 React 技术栈搭建一个企业级表单和表格组件系统，
包括 Ant Design UI 库、TypeScript、Vite、现代化的开发工具链。
请给我完整的搭建步骤和配置文件。
```

**触发方式**：自动识别 → 推荐使用 React 企业级项目搭建 Skill

### 场景 2：技术选型咨询

```
我要升级现有的 React 17 项目到 React 19，
应该选用 Ant Design 还是 shadcn/ui？
```

**触发方式**：获得决策建议后，可进一步启动 Skill

### 场景 3：快速初始化

```
/react-enterprise
我选择 Ant Design 方案，请帮我完成所有初始化步骤
```

**触发方式**：直接命令 + 参数确认

### 场景 4：分步执行

```
/react-enterprise
只帮我执行第二步和第三步（项目初始化和依赖安装）
```

**触发方式**：部分执行 Skill 的特定步骤

### 场景 5：现有项目迁移

```
我有一个用 @alifd/next 的 React 17 项目，
想迁移到 React 19 + Ant Design，需要方案
```

**触发方式**：自动识别 → 提供定制化的迁移指南

---

## Skill 输出物

完成 Skill 后，你将获得：

1. ✅ 完整的项目目录结构
2. ✅ 所有必需的配置文件（vite, tsconfig, tailwind, vitest 等）
3. ✅ 核心组件架构（EasyTable, EasyForm）
4. ✅ 路由配置示例
5. ✅ 开发命令和启动脚本
6. ✅ 性能优化清单
7. ✅ 部署指南

---

## 与其他 Skill 的协作

| Skill             | 配合场景                                   |
| ----------------- | ------------------------------------------ |
| `frontend-design` | 完成项目搭建后，需要设计高端的 UI 界面     |
| `easy-table-form` | 已有项目，需要实现 EasyTable/EasyForm 细节 |
| `.instructions`   | 团队协作，需要统一编码规范和最佳实践       |

---

## 扩展和自定义

如果你需要定制这个 Skill：

1. 编辑 `.claude/SKILL.md` 修改步骤和配置
2. 添加新的决策树分支
3. 更新依赖版本（当新版本发布时）

例如：

```
想在 Skill 基础上加入 Storybook 组件文档？
想添加 Docker 容器化部分？
想补充 GitHub Actions CI/CD 配置？
```

都可以通过修改 SKILL.md 实现。
