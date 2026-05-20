import { createBrowserRouter, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Menu } from "antd";

const Home = lazy(() => import("../views/Home"));
const About = lazy(() => import("../views/About"));
const Form = lazy(() => import("../views/Form"));
const Table = lazy(() => import("../views/Table"));
const DocumentList = lazy(() => import("../views/document"));
const DocumentForm = lazy(() => import("../views/document/Form"));

const menuItems = [
  { key: "/", label: "首页" },
  { key: "/form", label: "表单示例" },
  { key: "/table", label: "表格示例" },
  { key: "/document", label: "单据管理" },
  { key: "/about", label: "关于" },
];

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.startsWith("/document") ? "/document" : location.pathname;

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
            <Home />
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
