import App from "./App.jsx";
import "./styles.css";

const root = document.getElementById("root");

if (root) {
  root.innerHTML = App();
}
