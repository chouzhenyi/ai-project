import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";

const Home = lazy(() => import("../views/Home"));
const About = lazy(() => import("../views/About"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div style={{ padding: "20px" }}>
        <h1>企业级应用</h1>
        <nav>
          <a href="/">首页</a> | <a href="/about">关于</a>
        </nav>
      </div>
    ),
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
