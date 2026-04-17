import { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/axios";

const AuthContext = createContext(undefined);

const getStoredToken = () =>
  localStorage.getItem("aluverse_token") || localStorage.getItem("authToken");

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem("aluverse_token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

const normalizeAlumni = (alumniData) => {
  if (!alumniData) return null;

  const id = alumniData._id || alumniData.id || alumniData.uid || null;
  const profilePhoto =
    alumniData.profilePhoto ||
    alumniData.profilePicture ||
    alumniData.photoURL ||
    null;
  const currentJobTitle = alumniData.currentJobTitle || alumniData.title || "";
  const currentCompany = alumniData.currentCompany || alumniData.company || "";
  const currentLocation = alumniData.currentLocation || alumniData.location || "";

  return {
    ...alumniData,
    _id: id,
    id,
    uid: id,
    name: alumniData.name || alumniData.displayName || "",
    displayName: alumniData.displayName || alumniData.name || "",
    email: alumniData.email || "",
    role: alumniData.role || "alumni",
    profilePhoto,
    profilePicture: alumniData.profilePicture || profilePhoto,
    photoURL: alumniData.photoURL || profilePhoto,
    currentJobTitle,
    title: currentJobTitle,
    currentCompany,
    company: currentCompany,
    currentLocation,
    location: currentLocation,
    phone: alumniData.phone || "",
    skills: Array.isArray(alumniData.skills) ? alumniData.skills : [],
    isProfileComplete: Boolean(alumniData.isProfileComplete),
  };
};

export const AuthProvider = ({ children }) => {
  const [alumni, setAlumni] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const updateAuthState = (newToken, alumniData) => {
    const normalizedAlumni = normalizeAlumni(alumniData);

    if (newToken) {
      localStorage.setItem("aluverse_token", newToken);
      localStorage.setItem("authToken", newToken);
    }

    if (normalizedAlumni) {
      localStorage.setItem("user", JSON.stringify(normalizedAlumni));
    }

    setToken(newToken || null);
    setAlumni(normalizedAlumni);
    setIsLoggedIn(Boolean(newToken && normalizedAlumni));
    setLoading(false);
  };

  const refreshUser = async () => {
    const storedToken = getStoredToken();
    if (!storedToken) return null;

    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    });

    const alumniData = response.data?.alumni || response.data?.user || response.data;
    const normalizedAlumni = normalizeAlumni(alumniData);
    setAlumni(normalizedAlumni);
    localStorage.setItem("user", JSON.stringify(normalizedAlumni));
    return normalizedAlumni;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      // Always set loading to false immediately for fast initial render
      setLoading(false);

      if (!storedToken) {
        return;
      }

      // Fast boot path: hydrate from cache immediately
      if (storedUser) {
        setToken(storedToken);
        setAlumni(normalizeAlumni(storedUser));
        setIsLoggedIn(true);
      }

      // Verify auth in background without blocking UI
      try {
        const response = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        const alumniData = response.data?.alumni || response.data?.user || response.data;
        if (alumniData && (response.data?.success !== false)) {
          updateAuthState(storedToken, alumniData);
          return;
        }

        clearStoredAuth();
        setToken(null);
        setAlumni(null);
        setIsLoggedIn(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        // Keep cached user session for transient network/server issues.
        if (!storedUser) {
          clearStoredAuth();
          setToken(null);
          setAlumni(null);
          setIsLoggedIn(false);
        }
      }
    };

    checkAuth();
  }, []);

  const login = (newToken, alumniData) => {
    console.log("[AUTH] login() called", {
      hasToken: Boolean(newToken),
      alumniEmail: alumniData?.email,
      isFirstLogin: alumniData?.isFirstLogin,
      isProfileComplete: alumniData?.isProfileComplete,
    });

    updateAuthState(newToken, alumniData);
    setShowLoginModal(false);
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setAlumni(null);
    setIsLoggedIn(false);
    setShowLoginModal(false);
  };

  const updateAlumni = (newData) => {
    setAlumni((current) => {
      const merged = normalizeAlumni({ ...(current || {}), ...(newData || {}) });
      if (merged) {
        localStorage.setItem("user", JSON.stringify(merged));
      }
      return merged;
    });
  };

  const requireAuth = (action) => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return false;
    }

    if (typeof action === "function") {
      action();
    }

    return true;
  };

  const loginWithGoogle = async () => ({
    success: false,
    error: "Google sign-in is not configured in this build yet.",
  });

  return (
    <AuthContext.Provider
      value={{
        alumni,
        user: alumni,
        token,
        isLoggedIn,
        loading,
        showLoginModal,
        setShowLoginModal,
        isProfileComplete: Boolean(alumni?.isProfileComplete),
        login,
        logout,
        updateAlumni,
        refreshUser,
        requireAuth,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
