---
name: easy-table-form
description: 基于 @alifd/next 创建企业级 EasyTable 和 EasyForm 配置化组件，包含完整的环境搭建、组件实现、示例页面和文档规范。
version: 1.0.0
---

# EasyTable + EasyForm 企业级配置化组件搭建技能

## 技能目标

本技能指导如何创建两个核心企业级组件：**EasyTable**（配置化 CRUD 表格）和 **EasyForm**（Schema 驱动表单），并搭配完整的运行环境、示例页面和 API 文档。

---

## 1. 环境搭建

### 1.1 依赖安装

```bash
# 创建项目
pnpm create vite@latest my-app -- --template react-ts
cd my-app

# 核心业务库
pnpm install react-router-dom@6 @reduxjs/toolkit react-redux @alifd/next moment
pnpm install -D less @types/less

# 工程化工具
pnpm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks @eslint/js typescript-eslint
pnpm install -D husky @commitlint/cli @commitlint/config-conventional
pnpm install -D vite-plugin-compression terser vite-plugin-svg-icons
```

### 1.2 Vite 配置要点

- `@vitejs/plugin-react` 启用自动 JSX runtime
- `vite-plugin-compression` 开启 Gzip
- `vite-plugin-svg-icons` 管理 SVG 雪碧图
- LightningCSS 做 CSS 处理
- Terser 做生产构建压缩（`drop_console`/`drop_debugger`）
- 手动分包：`react-vendor`（React/ReactDOM/Router）、`next-vendor`（@alifd/next）
- 路径别名：`@` → `src/`、`@components`、`@views`、`@store`、`@router`

### 1.3 TypeScript 配置

- `target: ES2023`、`moduleResolution: bundler`、`jsx: react-jsx`
- 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`
- 使用 `verbatimModuleSyntax`

### 1.4 目录结构

```
src/
├── components/
│   ├── EasyTable.tsx       # 配置化表格组件
│   ├── EasyForm.tsx        # 配置化表单组件
│   ├── EasyTableExample.tsx # 表格示例（可选）
│   └── EasyFormExample.tsx  # 表单示例（可选）
├── views/
│   ├── Table.tsx           # 表格演示页面（8 个 Tab 示例）
│   └── Form.tsx            # 表单演示页面（11 个 Tab 示例）
├── store/
│   └── index.ts            # Redux store
├── router/
│   └── index.tsx           # 路由配置（懒加载）
├── types/
│   └── env.d.ts            # 环境变量与模块声明
├── App.tsx                 # 主入口
└── main.tsx                # ReactDOM 挂载点
```

---

## 2. EasyTable 组件

### 2.1 组件定位

基于 `@alifd/next` 的 `Table` 组件封装的 **配置化 CRUD 表格**，通过 Schema 声明式配置列定义、编辑控制、操作按钮等。

### 2.2 核心类型定义

```typescript
/** 列配置 */
interface ColumnSchema {
  key: string; // 列标识
  title: string; // 列标题
  dataIndex: string; // 数据字段
  width?: number | string; // 列宽度
  align?: "left" | "center" | "right";
  fixed?: "left" | "right"; // 固定列
  sortable?: boolean; // 可排序
  filterable?: boolean; // 可筛选
  type?: ColumnType; // 列类型：text | input | number | select | date | switch | checkbox | radio | custom
  editable?: EditableControl; // 编辑控制（boolean 或函数）
  visible?: VisibleControl; // 显示控制
  disabled?: DisabledControl; // 禁用控制
  options?: TableOptionItem[] | ((record, rowIndex) => TableOptionItem[]);
  placeholder?: string;
  format?: (value, record, rowIndex) => ReactNode;
  render?: (value, record, rowIndex) => ReactNode;
  editRender?: (props: EditRenderProps) => ReactNode;
  onChange?: (value, record, rowIndex, column) => void;
  validator?: (value, record, rowIndex) => string | boolean | Promise<string | boolean>;
  min?: number;
  max?: number;
  precision?: number;
  dateFormat?: string;
  componentProps?: Record<string, unknown>;
}

/** 操作列配置 */
interface ActionSchema {
  key: string;
  text?: string;
  icon?: string;
  type?: "primary" | "secondary" | "normal";
  visible?: boolean | ((record, rowIndex) => boolean);
  disabled?: boolean | ((record, rowIndex) => boolean);
  onClick?: (record, rowIndex) => void;
  confirm?: string;
  danger?: boolean;
}
```

### 2.3 表格实例 API（通过 ref 暴露）

| 方法                                             | 说明                                      |
| ------------------------------------------------ | ----------------------------------------- |
| `getData()`                                      | 获取所有数据                              |
| `setData(data)`                                  | 设置数据                                  |
| `getSelectedRows()`                              | 获取选中行                                |
| `addRow(row?, index?)`                           | 新增行                                    |
| `deleteRows(keys)`                               | 删除行（自动清理 added 记录）             |
| `updateRow(key, data)`                           | 更新行                                    |
| `getChanges()`                                   | 获取变更集 `{ added, modified, removed }` |
| `startEdit(key)` / `cancelEdit()` / `saveEdit()` | 行编辑控制                                |
| `validate()`                                     | 异步校验所有行（并行执行）                |

### 2.4 关键实现要点

1. **编辑模式**：支持 `row`（行编辑）和 `cell`（单元格编辑）
2. **变更追踪**：通过 `useRef` 追踪增删改，删除新增行时自动从 `added` 移除
3. **校验**：`validate()` 使用 `Promise.all` 并行执行所有列验证
4. **行 key 生成**：使用递增计数器 `keyCounterRef` 避免 `Math.random()` 碰撞
5. **自定义编辑**：通过 `editRender` 支持完全自定义编辑组件
6. **`custom` 类型**：必须提供 `editRender`，否则显示提示文案

### 2.5 关键 Props

```typescript
interface EasyTableProps {
  columns: ColumnSchema[];
  dataSource?: Record<string, unknown>[];
  rowKey?: string; // 默认 'id'
  editable?: boolean;
  editMode?: "row" | "cell";
  showIndex?: boolean;
  showActions?: boolean;
  actions?: ActionSchema[];
  showSelection?: boolean;
  pagination?: false | { current; pageSize; total; onChange };
  loading?: boolean;
  hasBorder?: boolean;
  isZebra?: boolean;
  maxBodyHeight?: number | string;
  fixedHeader?: boolean;
  showAddButton?: boolean;
  showDeleteButton?: boolean;
  renderToolbar?: (table: TableInstance) => ReactNode;
  renderFooter?: (table: TableInstance) => ReactNode;
  onChange?: (data, changes) => void;
}
```

---

## 3. EasyForm 组件

### 3.1 组件定位

基于 `@alifd/next` 的 `Form` 组件封装的 **Schema 驱动表单引擎**，通过 JSON Schema 声明式定义字段、校验、联动、异步选项等。

### 3.2 核心类型定义

```typescript
/** 组件类型 */
type ComponentType =
  | "Input"
  | "Input.Password"
  | "Input.TextArea"
  | "Select"
  | "SelectInfinite"
  | "TreeSelect"
  | "Cascader"
  | "DatePicker"
  | "DateRangePicker"
  | "TimePicker"
  | "NumberPicker"
  | "Switch"
  | "Checkbox"
  | "Radio"
  | "Rating"
  | "Upload"
  | "Custom";

/** 字段 Schema */
interface FormSchema {
  name: string; // 字段名
  label: string; // 标签
  component?: ComponentType; // 组件类型
  componentProps?: ComponentProps; // 组件属性（静态或动态函数）
  options?: OptionItem[] | OptionsLoader; // 选项（静态或异步函数）
  paginationOptions?: PaginationOptionsLoader; // 无限滚动分页加载
  rules?: ValidationRule[]; // 校验规则
  defaultValue?: unknown;
  placeholder?: string;
  required?: boolean; // 必填（视觉 + 校验）
  disabled?: DisabledControl; // 禁用控制（boolean 或函数）
  visible?: VisibleControl; // 显示控制
  labelAlign?: "left" | "top" | "inset"; // 字段级标签对齐
  dateFormat?: string; // 日期格式，默认 'YYYY-MM-DD'
  optionRender?: (option: OptionItem) => ReactNode; // 自定义下拉选项渲染
  span?: number; // 栅格占位（1-24）
  width?: string | number;
  tooltip?: string;
  help?: string;
  render?: (props: CustomRenderProps) => ReactNode; // Custom 类型时使用
  onChange?: (value, formValues, formActions) => void;
  effect?: (value, formValues, formActions) => void; // 字段联动
}

/** 选项类型 */
interface OptionItem {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: OptionItem[];
  extra?: Record<string, unknown>; // 选中时额外填充到表单的字段
}

/** 校验规则 */
interface ValidationRule {
  required?: boolean | string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  validator?: (value, formValues) => Promise<boolean | string> | boolean | string;
}
```

### 3.3 表单实例 API（通过 ref 暴露）

| 方法                             | 说明                                  |
| -------------------------------- | ------------------------------------- |
| `setValues(values)`              | 设置表单值                            |
| `setFieldValue(name, value)`     | 设置单个字段值                        |
| `getValues()`                    | 获取全部表单值                        |
| `getFieldValue(name)`            | 获取单个字段值                        |
| `reset()`                        | 重置表单                              |
| `validate()`                     | 校验表单（检查 `required` + `rules`） |
| `setFieldError(name, error)`     | 手动设置字段错误                      |
| `clearErrors()`                  | 清除所有错误                          |
| `setFieldOptions(name, options)` | 设置字段选项                          |
| `submit()`                       | 校验后提交                            |

### 3.4 关键实现要点

1. **校验**：`validate()` 同时检查 `required`（schema 级别的必填标记）和 `rules` 数组
2. **字段联动**：通过 `effect` 回调实现，接收 `(value, formValues, formActions)`
3. **异步选项**：`options` 支持 `() => Promise<OptionItem[]>` 异步加载
4. **无限滚动**：通过 `paginationOptions` 和 `SelectInfinite` 组件实现
5. **额外数据携带**：`OptionItem.extra` 在选中时通过 `formActions.setFieldValue()` 自动填充关联字段
6. **值稳定性**：使用 `valuesRef` 避免 `formActions` 在每次值变化时重建
7. **时间格式化**：`DatePicker` 和 `DateRangePicker` 使用 `format` + Moment 检测自动转为字符串
8. **禁用状态**：字段级 `disabled: (values) => boolean` 支持函数式动态禁用
9. **error 显示**：错误提示采用 `position: absolute` 定位在字段边框外，不撑高 Form.Item

### 3.5 表单级 Props

```typescript
interface EasyFormProps {
  schema: FormSchema[];
  initialValues?: Record<string, unknown>;
  onSubmit?: (values, form) => void | Promise<void>;
  onChange?: (values, form) => void;
  onReset?: (values, form) => void;
  labelCol?: { span?: number; fixedSpan?: number }; // 默认 { span: 6 }
  wrapperCol?: { span?: number }; // 默认 { span: 18 }
  labelAlign?: "left" | "top" | "inset"; // 默认 'left'
  columns?: number; // 栅格列数
  inline?: boolean;
  disabled?: boolean; // 整体禁用
  readonly?: boolean;
  showActions?: boolean; // 默认 true
  submitText?: string; // 默认 '提交'
  resetText?: string; // 默认 '重置'
  renderActions?: (form) => ReactNode;
  style?: React.CSSProperties;
}
```

### 3.6 样式约定

每个 Form.Item 被包裹在带边框的容器中：

```css
/* 边框容器 */
border: 1px solid #e5e7eb;
border-radius: 4px;
padding: 12px;

/* 错误时 */
border-color: #dc2626;
background: rgba(220, 38, 38, 0.2);

/* 禁用时 */
background: #eee;

/* 间距 */
/* 外层 padding: 10px 分隔字段 */
/* Form.Item margin-bottom: 0 清除默认间距 */
```

---

## 4. 路由配置

所有页面组件懒加载：

```typescript
const Home = React.lazy(() => import("@/views/Home"));
const FormPage = React.lazy(() => import("@/views/Form"));
const TablePage = React.lazy(() => import("@/views/Table"));
const About = React.lazy(() => import("@/views/About"));
```

---

## 5. 示例页面规范

### 5.1 EasyForm 示例（`src/views/Form.tsx`）

每个 Tab 一个独立函数组件，注册在 `FormDemo` 的 `items` 数组中：

| Tab          | 组件                  | 演示内容                       |
| ------------ | --------------------- | ------------------------------ |
| 基础表单     | `BasicFormDemo`       | Input/Select/日期，必填校验    |
| 字段联动     | `LinkedFormDemo`      | visible 控制显隐               |
| 异步选项     | `AsyncOptionsDemo`    | 异步 options + effect 联动     |
| 表单验证     | `ValidationDemo`      | required + pattern + validator |
| Ref控制      | `RefControlDemo`      | ref API 调用                   |
| 自定义组件   | `CustomComponentDemo` | Custom 类型 + render           |
| 无限滚动下拉 | `SelectInfiniteDemo`  | paginationOptions 分页加载     |
| 禁用状态     | `DisabledDemo`        | 字段级 + 表单级 disabled       |
| 联动禁用     | `LinkedDisabledDemo`  | disabled 函数 + effect         |
| 下拉携带数据 | `SelectExtraDemo`     | option.extra 自动填充          |
| 完整示例     | `CompleteFormDemo`    | 综合演示                       |

### 5.2 EasyTable 示例

若需要表格演示，参照相同模式在 `src/views/Table.tsx` 创建分 Tab 示例。

---

## 6. 开发指南

### 6.1 创建新表单

```tsx
const schema: FormSchema[] = [
  { name: "name", label: "姓名", component: "Input", required: true, span: 8 },
  { name: "age", label: "年龄", component: "NumberPicker", span: 8 },
  {
    name: "gender",
    label: "性别",
    component: "Select",
    span: 8,
    options: [
      { label: "男", value: "male" },
      { label: "女", value: "female" },
    ],
  },
];

<EasyForm schema={schema} onSubmit={(values) => console.log(values)} columns={3} />;
```

### 6.2 创建新表格

```tsx
const columns: ColumnSchema[] = [
  { key: "name", title: "姓名", dataIndex: "name", type: "input" },
  { key: "age", title: "年龄", dataIndex: "age", type: "number" },
];

<EasyTable
  columns={columns}
  dataSource={data}
  editable
  showActions
  actions={[
    { key: "edit", text: "编辑", onClick: (record) => {} },
    { key: "delete", text: "删除", danger: true, confirm: "确认删除？", onClick: (record) => {} },
  ]}
/>;
```

---

## 7. 常见问题

| 问题                         | 解决方案                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| ESLint 报 `react-hooks/refs` | `formActions` 内部方法绑定 `valuesRef`，传参给用户回调时加 `// eslint-disable-next-line react-hooks/refs` |
| 标签不在同行                 | 检查 `fullWidth` 是否移除；确认 `labelCol`/`wrapperCol` 已传递到 Form.Item                                |
| 校验不生效                   | 确认字段有 `required: true` 或 `rules: [{ required: "..." }]`；`validate()` 会同时检查两者                |
| DatePicker 返回 Moment       | `format` + 检测 `value.format` 函数特征，手动转为字符串                                                   |
| 选项不更新                   | 异步 `options` 通过 `setFieldOptions()` 更新；初始化在 `useEffect` 中                                     |
