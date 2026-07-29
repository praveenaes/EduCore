import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { loadUser } from "./app/authThunk";
import { setOrganization, clearOrganization } from "./app/slices/organizationSlice";
import { AppRoutes } from "./routes/AppRoutes";

function AppContent() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);

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
