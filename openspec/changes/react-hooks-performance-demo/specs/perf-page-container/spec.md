## ADDED Requirements

### Requirement: 页面 Tabs 容器

系统 SHALL 提供页面主容器组件，使用 Ant Design Tabs 承载 4 个 Demo Tab。

#### Scenario: 展示 4 个 Tab 标签页

- **WHEN** 用户访问性能优化页面
- **THEN** 页面显示 4 个 Tab：React.memo / useMemo / useCallback / useMemoizedFn
- **AND** 默认激活第一个 Tab (React.memo)
- **AND** 每个 Tab 的面板内容为对应的 Demo 组件

#### Scenario: Tab 切换时内容区有入场动画

- **WHEN** 用户点击切换 Tab
- **THEN** 新内容区以 fadeInUp 动画入场（上滑 + 淡入, 300ms）

### Requirement: 页面标题和 Strict Mode 提示

系统 SHALL 在页面顶部显示标题和 React Strict Mode 说明。

#### Scenario: 显示页面标题

- **WHEN** 用户进入性能优化页面
- **THEN** 页面顶部显示 h2 标题「React Hooks 性能优化对比」

#### Scenario: 显示 Strict Mode 提示

- **WHEN** 用户进入性能优化页面
- **THEN** 标题下方显示 Alert type="info" 提示条
- **AND** 提示内容说明：开发模式下 React Strict Mode 可能导致渲染计数 ×2，这是正常行为

### Requirement: 页面懒加载导出

系统 SHALL 以 default export 导出页面组件，支持路由 lazy loading。

#### Scenario: 路由配置可 lazy 加载此页面

- **WHEN** 路由配置使用 `lazy(() => import("../views/performanceOptimization"))`
- **THEN** 页面组件正确加载并渲染
