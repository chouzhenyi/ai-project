import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import mobileRouter from "./router/mobile";
import "virtual:svg-icons-register";

function isMobile() {
  return window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const appRouter = isMobile() ? mobileRouter : router;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={appRouter} future={{ v7_startTransition: true }} />,
);
