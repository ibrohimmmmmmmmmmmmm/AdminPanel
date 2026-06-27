import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "./Layout/Layout"
import { Dashboard, Login, Product, Order, Other, AddProductDetails, EditProductDetails } from "./router/router"
import { Toaster } from "sonner"

import ProtectedRoute from "./router/ProtectedRoute"

export default function App() {
  const router = createBrowserRouter([
    {
      path : "/",
      element :<Login />
    },
    {
      path : "/admin",
      element : (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
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
          path: "products/add",
          element: <AddProductDetails />
        },
        {
          path: "products/edit/:id",
          element: <EditProductDetails />
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
