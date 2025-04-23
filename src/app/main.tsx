import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import router from "@/app/router";

import "@/assets/styles/index.scss"

createRoot(document.getElementById("root") as HTMLElement).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
