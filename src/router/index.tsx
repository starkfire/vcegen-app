import { createBrowserRouter, type RouteObject } from "react-router-dom"

import App from "@/App"

const routes: RouteObject[] = [
    {
        path: "/",
        element: <App />
    }
]

export default createBrowserRouter(routes)
