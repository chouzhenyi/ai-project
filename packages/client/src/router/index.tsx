import { createBrowserRouter, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Menu } from "antd";

const About = lazy(() => import("../views/About"));
const Form = lazy(() => import("../views/Form"));
const Table = lazy(() => import("../views/Table"));
const DocumentList = lazy(() => import("../views/document"));
const DocumentForm = lazy(() => import("../views/document/Form"));
const ItemsList = lazy(() => import("../views/items"));
const ItemForm = lazy(() => import("../views/items/Form"));
const Dashboard = lazy(() => import("../views/dashboard"));
const ContainersPage = lazy(() => import("../views/containers"));
const TransactionsPage = lazy(() => import("../views/transactions"));
const PerformancePage = lazy(() => import("../views/performanceOptimization"));

const menuItems = [
  { key: "/", label: "仪表盘" },
  { key: "/items", label: "物品管理" },
  { key: "/containers", label: "容器管理" },
  { key: "/transactions", label: "出入库" },
  { key: "/document", label: "单据管理" },
  { key: "/form", label: "表单示例" },
  { key: "/table", label: "表格示例" },
  { key: "/performance", label: "性能优化" },
  { key: "/about", label: "关于" },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    ["/document", "/items", "/containers", "/transactions", "/performance"].find((k) =>
      location.pathname.startsWith(k),
    ) || location.pathname;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Menu
        style={{ width: 200 }}
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => navigate(key)}
        items={menuItems}
      />
      <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "items",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <ItemsList />
          </Suspense>
        ),
      },
      {
        path: "items/:id",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <ItemForm />
          </Suspense>
        ),
      },
      {
        path: "containers",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <ContainersPage />
          </Suspense>
        ),
      },
      {
        path: "transactions",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <TransactionsPage />
          </Suspense>
        ),
      },
      {
        path: "form",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Form />
          </Suspense>
        ),
      },
      {
        path: "table",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <Table />
          </Suspense>
        ),
      },
      {
        path: "performance",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <PerformancePage />
          </Suspense>
        ),
      },
      {
        path: "about",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "document",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <DocumentList />
          </Suspense>
        ),
      },
      {
        path: "document/form/:id?",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <DocumentForm />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
