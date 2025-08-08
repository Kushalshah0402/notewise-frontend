// AuthContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unseenWarnings, setUnseenWarnings] = useState(0);
  const [unseenInbox, setUnseenInbox] = useState(0);
  const API_URL = process.env.REACT_APP_API_URL;

  /* ------------------------- helper -------------------------- */
  const persist = (u, t) => {
    console.log("💾 Persisting user:", u);
    console.log("👉 Persisted user role:", u?.role);
    setUser(u);
    setToken(t);
    if (u && t) {
      localStorage.setItem("user", JSON.stringify({ user: u, token: t }));
      axios.defaults.headers.common.Authorization = `Bearer ${t}`; // ⬅️ add header
    } else {
      localStorage.removeItem("user");
      delete axios.defaults.headers.common.Authorization;
    }
  };

  /* ------------------------- login / logout ------------------ */
  const login = (userData, jwt) => {
    console.log("🧪 login() called with userData:", userData);
    const cleanUser = {
      ...userData,
      role: userData.role,
      avatar:
        typeof userData.avatar === "object"
          ? userData.avatar?.path || "/images/avatar.png"
          : userData.avatar,
    };
    persist(cleanUser, jwt);
  };
  const logout = useCallback((redirectTo = "/sign-up") => {
    sessionStorage.removeItem("toastedWarnings");
    persist(null, null);
    window.location.assign(redirectTo);
  }, []);

  /* ------------------------- load from LS on boot ------------ */
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored);

    if (parsed.user?.isActive === false) {
      window.location.assign("/suspended");
      return;
    }

    console.log("🧠 Hydrating from LS:", parsed);
    persist(parsed.user, parsed.token);
    setLoading(false); // ✅ Only after persist finishes
  }, []);

  /* ------------------------- axios interceptors -------------- */
  useEffect(() => {
    const reqId = axios.interceptors.request.use((cfg) => {
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      return cfg;
    });

    const resId = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        const code = err.response?.status;
        const reason = err.response?.data?.reason;

        if (code === 403 && reason === "suspended") {
          // wipe any local auth + jump to suspension page
          logout("/suspended");
          return; // we’re done – don’t keep the promise chain alive
        }

        if (code === 401) logout();
        return Promise.reject(err);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [token, logout]); // <- rerun if token changes

  // useEffect(() => {
  //   const stored = localStorage.getItem("user");
  //   if (stored) {
  //     const { user: u, token: t } = JSON.parse(stored);
  //     persist(u, t);
  //   }
  //   setLoading(false); // ✅ done loading
  // }, []);

  useEffect(() => {
    const fetchUnseen = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/warnings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const unseen = res.data.warnings.filter((w) => w.seen === false);
          setUnseenWarnings(unseen.length);

          // ✅ Get toasted IDs from sessionStorage
          const toastedIds = JSON.parse(
            sessionStorage.getItem("toastedWarnings") || "[]"
          );

          // ✅ Show only un-toasted ones
          const newWarnings = unseen.filter((w) => !toastedIds.includes(w.at));

          newWarnings.forEach((w) => {
            toast.warn(w.message, { autoClose: false });
            toastedIds.push(w.at); // or w._id if you have it
          });

          // ✅ Update sessionStorage
          sessionStorage.setItem("toastedWarnings", JSON.stringify(toastedIds));
        }
      } catch (err) {
        console.error("Failed to fetch unseen warnings", err);
      }
    };

    if (user && token) fetchUnseen();
  }, [user, token]);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/messages/inbox`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const unseen = res.data.messages.filter((m) => !m.read);
        setUnseenInbox(unseen.length);
      } catch (err) {
        console.error("Failed to fetch unseen inbox messages", err);
      }
    };

    if (user && token) fetchInbox();
  }, [user, token]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.user = updatedUser;
      localStorage.setItem("user", JSON.stringify(parsed));
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data.user.isActive === false) logout("/suspended");
        else updateUser(res.data.user);
      } catch (e) {
        /* ignore network errors here */
      }
    }, 120_000); // every 2 minutes
    return () => clearInterval(id);
  }, [token, updateUser, logout]);

  /* ------------------------- expose context ------------------ */

  const updateProfile = async ({ username, email, idCard }) => {
    console.log("🚀 Sending update:", { username, email, idCard });

    const form = new FormData();
    form.append("username", username);
    form.append("email", email);
    if (idCard) form.append("idCard", idCard);

    const res = await axios.put(
      `${API_URL}/api/auth/update-profile/${user._id}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    updateUser(res.data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        updateProfile,
        loading,
        unseenWarnings,
        setUnseenWarnings,
        unseenInbox,
        setUnseenInbox,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
