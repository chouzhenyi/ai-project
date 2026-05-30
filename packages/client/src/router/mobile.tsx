import { createBrowserRouter, Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";

const ScanPage = lazy(() => import("../mobile/Scan"));
const CheckInPage = lazy(() => import("../mobile/CheckIn"));
const CheckOutPage = lazy(() => import("../mobile/CheckOut"));
const ContainerItemsPage = lazy(() => import("../mobile/ContainerItems"));
const ItemDetailPage = lazy(() => import("../mobile/ItemDetail"));
const NewContainerPage = lazy(() => import("../mobile/NewContainer"));
const ItemsListPage = lazy(() => import("../mobile/ItemsList"));
const ContainersListPage = lazy(() => import("../mobile/ContainersList"));

const tabs = [
  { key: "/m/scan", label: "🔍 扫码" },
  { key: "/m/items", label: "📦 物品" },
  { key: "/m/containers", label: "🗄️ 容器" },
  { key: "/m/checkin", label: "📥 入库" },
  { key: "/m/checkout", label: "📤 出库" },
];

const MobileLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTabRoute = tabs.some((t) => location.pathname === t.key);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>
      {isTabRoute && (
        <div style={{ display: "flex", borderTop: "1px solid #f0f0f0", background: "#fff", position: "sticky", bottom: 0 }}>
          {tabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => navigate(tab.key)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "10px 0",
                cursor: "pointer",
                color: location.pathname === tab.key ? "#1890ff" : "#999",
                fontSize: 13,
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const mobileRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/m/scan" />,
  },
  {
    path: "/m",
    element: <MobileLayout />,
    children: [
      { index: true, element: <Suspense fallback={<div>加载中...</div>}><ScanPage /></Suspense> },
      { path: "scan", element: <Suspense fallback={<div>加载中...</div>}><ScanPage /></Suspense> },
      { path: "items", element: <Suspense fallback={<div>加载中...</div>}><ItemsListPage /></Suspense> },
      { path: "containers", element: <Suspense fallback={<div>加载中...</div>}><ContainersListPage /></Suspense> },
      { path: "checkin", element: <Suspense fallback={<div>加载中...</div>}><CheckInPage /></Suspense> },
      { path: "checkout", element: <Suspense fallback={<div>加载中...</div>}><CheckOutPage /></Suspense> },
      { path: "box/:id", element: <Suspense fallback={<div>加载中...</div>}><ContainerItemsPage /></Suspense> },
      { path: "item/:id", element: <Suspense fallback={<div>加载中...</div>}><ItemDetailPage /></Suspense> },
      { path: "new-container", element: <Suspense fallback={<div>加载中...</div>}><NewContainerPage /></Suspense> },
    ],
  },
]);

export default mobileRouter;
