import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useLoginStore } from "../LoginZustand";
import { useNavigate } from "react-router-dom";
import img from "../../assets/Group 1116606595 (7).png"
type LoginForm = {
  userName: string;
  password: string;
};

export default function Login() {
  const { postLogin } = useLoginStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const { register, handleSubmit, reset } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);

      const result = await postLogin(data);

      const token = typeof result === "string" ? result : result?.token;

      if (token) {
        localStorage.setItem("token", token);
        navigate("/admin");
        reset();
      } else {
        console.error("Login failed:", result);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.15); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, 40px) scale(1.2); }
        }
        @keyframes cartFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.15); }
          50% { box-shadow: 0 0 30px rgba(99,102,241,0.6), 0 0 60px rgba(99,102,241,0.25); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; opacity: 0; }
        .blob1 { animation: blobFloat1 12s ease-in-out infinite; }
        .blob2 { animation: blobFloat2 15s ease-in-out infinite; }
        .cart-float { animation: cartFloat 4s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #818cf8 0%, #fff 50%, #818cf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .input-3d {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .input-3d:focus {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 8px 20px -4px rgba(99,102,241,0.25);
        }
        .btn-3d {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-3d:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -6px rgba(79,70,229,0.5);
        }
        .btn-3d:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .btn-3d::before {
          content: "";
          position: absolute;
          top: 0; left: -75%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .btn-3d:hover::before {
          left: 125%;
        }
      `}</style>

      {/* Left panel */}
      <div
        className="hidden md:flex md:w-1/2 relative items-center justify-center p-12"
        style={{
          background: "linear-gradient(135deg, #0a0e1a 0%, #131a2e 50%, #0a0e1a 100%)",
        }}
      >
        <div
          className="blob1 absolute top-10 left-10 w-72 h-72 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #4f46e5, transparent 70%)" }}
        />
        <div
          className="blob2 absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }}
        />

        <div className="relative z-10 text-center fade-up" style={{ animationDelay: "0.1s" }}>
          <p className="text-gray-300 text-lg mb-6 tracking-wide">
            Welcome to admin panel
          </p>

          <img src={img} alt="" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div
          className="w-full max-w-sm"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.2s ease-out",
          }}
        >
          <div className="fade-up" style={{ animationDelay: "0.05s" }}>
            <h2
              className="text-3xl font-bold text-gray-900 mb-8"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Log in
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="fade-up" style={{ animationDelay: "0.15s" }}>
              <input
                type="text"
                placeholder="Email"
                {...register("userName")}
                className="input-3d w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="fade-up relative" style={{ animationDelay: "0.25s" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                className="input-3d w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-500 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="fade-up text-right" style={{ animationDelay: "0.32s" }}>
              <a
                href="#"
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <div className="fade-up" style={{ animationDelay: "0.4s" }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-3d w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 disabled:opacity-60"
              >
                {loading ? "Loading..." : "Log in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}