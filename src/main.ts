import { registerServiceWorker } from "./pwa";
import { mountApp } from "./ui/app";
import "./ui/style.css";
import "./ui/expansion.css";
mountApp(document.getElementById("app")!);

registerServiceWorker();
