import { useState } from "react";
import AdminSidebar from "../../layouts/AdminSidebar";
import Dashboard from "./Dashboard";
import KelolaDataMurid from "./kelolaDataMurid/KelolaDataMurid";
import KelolaDataKonseling from "./kelolaKonseling/KelolaDataKonseling";
import KelolaLiveChat from "./kelolaLiveChat/KelolaLiveChat";
import KelolaDataBeasiswa from "./kelolaBeasiswa/KelolaDataBeasiswa";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [consultationInitialTab, setConsultationInitialTab] = useState<
    "pending" | "active" | "completed" | "declined"
  >("pending");
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(
    null
  );

  const getActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            setConsultationInitialTab={setConsultationInitialTab}
            setSelectedChatUserId={setSelectedChatUserId}
          />
        );
      case "kelola-data-murid":
        return <KelolaDataMurid />;
      case "kelola-data-konseling":
        return (
          <KelolaDataKonseling
            setActiveTab={setActiveTab}
            initialTab={consultationInitialTab}
            setSelectedChatUserId={setSelectedChatUserId}
          />
        );
      case "kelola-live-chat":
        return (
          <KelolaLiveChat
            preSelectedUserId={selectedChatUserId}
            onUserSelected={() => setSelectedChatUserId(null)}
          />
        );
      case "kelola-data-beasiswa":
        return <KelolaDataBeasiswa />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DarkModeProvider>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 p-10">{getActiveTab()}</div>
      </div>
    </DarkModeProvider>
  );
};

export default AdminDashboard;
