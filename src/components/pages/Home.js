import React, { useState, useEffect } from "react";
import "../../App.css";
import HeroSection from "../HeroSection";
import Cards from "../Cards";
import Footer from "../Footer";
import { useAuth } from "../AuthContext";
import DashboardBanner from "../DashboardBanner";
import UpdateModules from "../UpdateModules";
import CurrentModulesBar from "../CurrentModulesBar";

function Home() {
  const { user, token, updateUser } = useAuth();
  const [modulesUpdated, setModulesUpdated] = useState(false);
  const [currentModules, setCurrentModules] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user) {
      setCurrentModules(user.currentModules || []);
    }
  }, [user, modulesUpdated]);

  const handleRemoveModule = async (modToRemove) => {
    const updated = currentModules.filter(
      (m) => m.toUpperCase() !== modToRemove.toUpperCase()
    );

    try {
      const res = await fetch(`${API_URL}/api/auth/update-modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ modules: updated }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentModules(data.user.currentModules);
        updateUser(data.user); // keep context in sync
        setModulesUpdated((prev) => !prev); // to trigger card re-fetch
      }
    } catch (err) {
      console.error("Failed to update modules:", err);
    }
  };

  return (
    <div style={{backgroundColor: "white"}}>
      {!user ? <HeroSection /> : <DashboardBanner />}
      {user && (
        <UpdateModules
          onModulesUpdated={() => setModulesUpdated((prev) => !prev)}
        />
      )}
      {user && (
        <CurrentModulesBar
          modules={currentModules}
          onRemove={handleRemoveModule}
        />
      )}
      <Cards refreshTrigger={modulesUpdated} />
      <Footer />
    </div>
  );
}

export default Home;
