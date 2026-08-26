import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { LocalizationProvider, getCurrentLocale, getLocaleDirection } from "./localization/index.js";
import "./styles.css";

const initialLocale = getCurrentLocale();

document.documentElement.lang = initialLocale;
document.documentElement.dir = getLocaleDirection(initialLocale);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LocalizationProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LocalizationProvider>
    </BrowserRouter>
  </StrictMode>
);
