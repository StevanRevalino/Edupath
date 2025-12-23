import { Outlet } from "react-router-dom";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";

const UserLayout = () => {
  return (
    <div className="bg-gray-100 text-lg h-full">
      <Header />

      {/* Konten */}
      <main className="py-24">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UserLayout;
