import { useState } from "react";
import AdminSidebar from "../../layouts/AdminSidebar";
import KelolaDataMurid from "./KelolaDataMurid";
import KelolaDataKonseling from "./KelolaDataKonseling";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("kelola-data-murid");

  const getActiveTab = () => {
    switch (activeTab) {
      case "kelola-data-murid":
        return <KelolaDataMurid />;
      case "kelola-data-konseling":
        return <KelolaDataKonseling />;
      default:
        return <KelolaDataMurid />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-20">{getActiveTab()}</div>
    </div>
  );
};

export default AdminDashboard;
