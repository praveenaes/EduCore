import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { loadUser } from "./app/authThunk";
import { setOrganization, clearOrganization } from "./app/slices/organizationSlice";
import { AppRoutes } from "./routes/AppRoutes";
import { tokenService } from "./utils/tokenService";
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from "./services/notificationSocket";

function AppContent() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const initializeAuth = async () => {
      const resultAction = await dispatch(loadUser());
      if (loadUser.fulfilled.match(resultAction)) {
        dispatch(
          setOrganization({
            name: "EduCore School",
          })
        );
      } else {
        dispatch(clearOrganization());
      }
    };

    initializeAuth();
  }, [dispatch]);

  useEffect(() => {
    const token = accessToken || tokenService.getToken();
    if (isAuthenticated && token) {
      connectNotificationSocket(token, dispatch, user?.id, user?.role);
    } else {
      disconnectNotificationSocket();
    }
    return () => {
      disconnectNotificationSocket();
    };
  }, [isAuthenticated, accessToken, user?.id, user?.role, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return <AppRoutes />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}