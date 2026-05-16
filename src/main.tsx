import ReactDOM from "react-dom";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "@alifd/next/dist/next.css";
import "virtual:svg-icons-register";

ReactDOM.render(<RouterProvider router={router} />, document.getElementById("root"));
