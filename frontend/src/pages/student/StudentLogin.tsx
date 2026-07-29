import React, { useState } from "react";
import {  useNavigate } from "react-router-dom";
import { LoginForm } from "../../components/auth/LoginForm";
import type { LoginPayload } from "../../types/auth";
import { UserRoleEnum } from "../../types/auth";
import { useAppDispatch } from "../../app/hooks";
import { loginUser } from "../../app/authThunk";
import { setOrganization } from "../../app/slices/organizationSlice";

export const StudentLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLoginSubmit = async (payload: LoginPayload) => {
    setLoading(true);
    setApiError(null);

    try {
      const resultAction = await dispatch(
        loginUser({ role: UserRoleEnum.STUDENT, credentials: payload })
      );

      if (loginUser.fulfilled.match(resultAction)) {
        dispatch(
          setOrganization({
            name: "EduCore School",
          })
        );
        navigate("/student/dashboard");
      } else {
        setApiError((resultAction.payload as string) || "Login failed");
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          
        </div>

        <LoginForm
          title="EduCore"
          role={UserRoleEnum.STUDENT}
          loading={loading}
          submitHandler={handleLoginSubmit}
          error={apiError}
        />
      </div>
    </div>
  );
};

export default StudentLogin;
