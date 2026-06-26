import { lazy } from "react";

export const Login = lazy(() => import ("../pages/Login/Login"));
export const Dashboard = lazy(() => import ("../pages/Dashboard/Dashboard"));
export const Product = lazy(() => import ("../pages/Product/Product"));
export const Order = lazy(() => import ("../pages/Order/Order"));