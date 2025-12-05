import { useState } from "react";
import AdminSidebar from "../../layouts/AdminSidebar";
import Dashboard from "./Dashboard";
import KelolaDataMurid from "./kelolaDataMurid/KelolaDataMurid";
import KelolaDataKonseling from "./kelolaKonseling/KelolaDataKonseling";
import KelolaLiveChat from "./kelolaLiveChat/KelolaLiveChat";
import KelolaDataBeasiswa from "./kelolaBeasiswa/KelolaDataBeasiswa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [consultationInitialTab, setConsultationInitialTab] = useState<
    "pending" | "active" | "completed" | "declined"
  >("pending");

  const getActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setActiveTab={setActiveTab} setConsultationInitialTab={setConsultationInitialTab} />;
      case "kelola-data-murid":
        return <KelolaDataMurid />;
      case "kelola-data-konseling":
        return <KelolaDataKonseling setActiveTab={setActiveTab} initialTab={consultationInitialTab} />;
      case "kelola-live-chat":
        return <KelolaLiveChat />;
      case "kelola-data-beasiswa":
        return <KelolaDataBeasiswa />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-10">{getActiveTab()}</div>
    </div>
  );
};

export default AdminDashboard;
