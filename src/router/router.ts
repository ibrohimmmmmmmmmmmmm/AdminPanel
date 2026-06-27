import { lazy } from "react";

export const Login = lazy(() => import("../pages/Login/Login"));
export const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
export const Users = lazy(() => import("../pages/Users/Users"));
export const Product = lazy(() => import("../pages/Product/Product"));
export const AddProductDetails = lazy(() => import("../pages/Product/AddProductDetails"));
export const EditProductDetails = lazy(() => import("../pages/Product/EditProductDetails"));
export const Order = lazy(() => import("../pages/Order/Order"));
export const Other = lazy(() => import("../pages/Other/Other"));