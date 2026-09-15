import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import type { UserRole, LoginPayload } from "../../types/auth";
import { loginValidationSchema } from "../../validators/authValidator";

interface LoginFormProps {
  title: string;
  role: UserRole;
  loading: boolean;
  submitHandler: (payload: LoginPayload) => void | Promise<void>;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  title,
  role,
  loading,
  submitHandler,
  error,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {//return boolean value
    try {
      loginValidationSchema.validateSync({ email, password }, { abortEarly: false });//Yup collects ALL errors.
      setErrors({});
      return true;
    } catch (err: any) {
      if (err.name === "ValidationError") {
        const tempErrors: { email?: string; password?: string } = {};
        err.inner.forEach((validationError: any) => {//err.inner-Yup creates something like(arr of err)
          if (validationError.path) {
            tempErrors[validationError.path as "email" | "password"] = validationError.message;
          }
        });
        setErrors(tempErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();//Prevent refresh:
    if (validate()) {
      submitHandler({ email, password });
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-neutral-200/50 transition-all duration-300 hover:shadow-md">
      {/* Header inside Form for complete encapsulation */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-2xl shadow-sm">
          {title.charAt(0).toUpperCase()}
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-neutral-800 tracking-tight animate-fade-in">
          {title}
        </h2>
        <p className="mt-1 text-sm font-semibold text-brand-600 uppercase tracking-wider">
          {role} Portal
        </p>
        
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger border border-danger/20">
            {error}
          </div>
        )}
        <div className="space-y-4 rounded-md">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-600">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder={`${role}@educore.com`}
              disabled={loading}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.email
                  ? "border-danger focus:border-danger focus:ring-danger/20"
                  : "border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-danger font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-600">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                disabled={loading}
                className={`block w-full rounded-lg border px-3 py-2 pr-10 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.password
                    ? "border-danger focus:border-danger focus:ring-danger/20"
                    : "border-neutral-200 focus:border-brand-500 focus:ring-brand-500/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-danger font-medium">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            to={`/auth/forgot-password?role=${role}`}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default LoginForm;
