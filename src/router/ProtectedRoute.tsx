import { Navigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

/**
 * Decode a JWT token payload without any library.
 * Returns null if the token is invalid or missing.
 */
function decodeToken(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url -> Base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired.
 * Returns true if the token is expired or invalid.
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  return Date.now() >= decoded.exp * 1000;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const token = localStorage.getItem("access") || localStorage.getItem("token");

    if (!token) {
      setStatus("unauthenticated");
      return;
    }

    if (isTokenExpired(token)) {
      // Token is expired — clean up and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setStatus("unauthenticated");
      return;
    }

    setStatus("authenticated");
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <span className="text-gray-400 text-sm font-medium">Verifying access...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
