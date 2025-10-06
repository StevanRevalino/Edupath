import { useState } from "react";
import AdminSidebar from "../../layouts/AdminSidebar";
import KelolaDataMurid from "./components/KelolaDataMurid";
import KelolaDataKonseling from "./components/KelolaDataKonseling";
import KelolaLiveChat from "./components/KelolaLiveChat";
import KelolaDataBeasiswa from "./components/KelolaDataBeasiswa";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("kelola-data-murid");

  const getActiveTab = () => {
    switch (activeTab) {
      case "kelola-data-murid":
        return <KelolaDataMurid />;
      case "kelola-data-konseling":
        return <KelolaDataKonseling />;
      case "kelola-live-chat":
        return <KelolaLiveChat />;
      case "kelola-data-beasiswa":
        return <KelolaDataBeasiswa />;
      default:
        return <KelolaDataMurid />;
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
