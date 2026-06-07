## MODIFIED Requirements

### Requirement: 侧边栏路由菜单包含性能优化入口

路由配置的 `menuItems` 数组 SHALL 包含性能优化页面的菜单项。

#### Scenario: 侧边栏显示「性能优化」菜单项

- **WHEN** 用户查看侧边栏导航菜单
- **THEN** 菜单中包含 `{ key: "/performance", label: "性能优化" }` 条目
- **AND** 该条目位于「关于」菜单项之前（保持现有顺序）

### Requirement: 路由 children 配置包含 performance 路由

路由 `createBrowserRouter` 的 children 数组 SHALL 包含 `/performance` 路由配置。

#### Scenario: 访问 /performance 路径时渲染性能优化页面

- **WHEN** 用户导航到 `/performance`
- **THEN** 路由匹配并渲染 PerformancePage 组件
- **AND** 组件被 Suspense 包裹，加载中显示「加载中...」

#### Scenario: 性能优化页面使用懒加载

- **WHEN** 路由配置引用性能优化页面
- **THEN** 使用 `lazy(() => import("../views/performanceOptimization"))` 方式导入
- **AND** 与其他页面（Dashboard、Form、Table 等）的懒加载模式一致
