import { createBrowserRouter, Outlet, useNavigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Menu } from "@alifd/next";

const Home = lazy(() => import("../views/Home"));
const About = lazy(() => import("../views/About"));
const Form = lazy(() => import("../views/Form"));

const menuItems = [
  { key: "/", label: "首页" },
  { key: "/form", label: "表单" },
  { key: "/about", label: "关于" },
];

const Layout = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Menu style={{ width: 200 }} onItemClick={(key: string) => navigate(key)}>
        {menuItems.map((item) => (
          <Menu.Item key={item.key}>{item.label}</Menu.Item>
        ))}
      </Menu>
      <div style={{ flex: 1, padding: "20px" }}>
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
        path: "about",
        element: (
          <Suspense fallback={<div>加载中...</div>}>
            <About />
          </Suspense>
        ),
      },
    ],
  },
]);

export default router;
