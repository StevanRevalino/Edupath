import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

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
