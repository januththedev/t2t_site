import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import type { Payload } from "./types";
import "./fonts.css";
import "./refined.css";
const node = document.getElementById("t2t-data");
if (node) {
  const payload = JSON.parse(node.textContent || "{}") as Payload;
  hydrateRoot(document.getElementById("root")!, <App payload={payload} />);
}
import("./enhance");
