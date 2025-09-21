import { useState } from "react";
import AdminSidebar from "../../layouts/AdminSidebar";
import KelolaDataMurid from "./KelolaDataMurid";
import KelolaDataKonseling from "./KelolaDataKonseling";
import KelolaLiveChat from "./KelolaLiveChat";

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
