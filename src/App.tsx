import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "./Layout/Layout"
import { Dashboard, Login, Product, Order, Other } from "./router/router"
import { Toaster } from "sonner"

export default function App() {
  const router = createBrowserRouter([
    {
      path : "/",
      element :<Login />
    },
    {
      path : "/admin",
      element : <Layout />,
      children : [
        {
          index : true,
          element : <Dashboard />
        },
        {
          path: "products",
          element: <Product />
        },
        {
          path: "orders",
          element: <Order />
        },
        {
          path: "other",
          element: <Other />
        }
      ]
    }
  ])
  return (
    <>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </>
  )
}
