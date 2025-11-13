import logo from "../assets/edupath-logo.png";
import homeIcon from "../assets/icons/home-icon.png";
import jurusanIcon from "../assets/icons/jurusan-icon.png";
import konselingIcon from "../assets/icons/conseling-footer.png";
import tesIcon from "../assets/icons/tes-icon.png";
import universitasIcon from "../assets/icons/universitas-icon.png";
import callIcon from "../assets/icons/call-icon.png";
import emailIcon from "../assets/icons/email-icon.png";
import instagramIcon from "../assets/icons/instagram-icon.png";
import twitterIcon from "../assets/icons/twitter-icon.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary to-[#4A9FD9] text-white py-8 px-4 sm:py-10 sm:px-6 md:py-12 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Logo dan Deskripsi */}
          <div className="flex flex-col items-start sm:col-span-2 lg:col-span-1">
            <img
              src={logo}
              alt="Edupath Logo"
              className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto mb-3 md:mb-4"
            />
            <p className="text-xs sm:text-sm md:text-base leading-relaxed">
              Memilih jurusan sesuai minat dan bakatmu. EduPath percaya bahwa
              semua orang berhak memiliki karir yang sesuai dengan passion dan
              minat.
            </p>
          </div>

          {/* Navigation */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Navigation
            </h3>
            <div className="bg-[#417A99] w-[80px] sm:w-[100px] md:w-[120px] h-1 mb-3 md:mb-4 mt-1" />
            <nav className="space-y-2 md:space-y-3">
              <a
                href="/home"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-sm md:text-base"
              >
                <span>
                  <img
                    src={homeIcon}
                    alt="Home Icon"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </span>
                <span>Home</span>
              </a>
              <a
                href="/tes"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-sm md:text-base"
              >
                <span>
                  <img
                    src={tesIcon}
                    alt="Tes Icon"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </span>
                <span>Tes</span>
              </a>
              <a
                href="/jurusan"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-sm md:text-base"
              >
                <span>
                  <img
                    src={jurusanIcon}
                    alt="Jurusan Icon"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </span>
                <span>Jurusan</span>
              </a>
              <a
                href="/universitas"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-sm md:text-base"
              >
                <span>
                  <img
                    src={universitasIcon}
                    alt="Universitas Icon"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </span>
                <span>Universitas</span>
              </a>
              <a
                href="/konseling"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-sm md:text-base"
              >
                <span>
                  <img
                    src={konselingIcon}
                    alt="Konseling Icon"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </span>
                <span>Konseling</span>
              </a>
              <a
                href="/beasiswa"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity text-sm md:text-base"
              >
                <span>
                  <img
                    src={homeIcon}
                    alt="Beasiswa Icon"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </span>
                <span>Beasiswa</span>
              </a>
            </nav>
          </div>

          {/* Contact Us */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Contact Us
            </h3>
            <div className="bg-[#417A99] w-[80px] sm:w-[100px] md:w-[120px] h-1 mb-3 md:mb-4 mt-1" />
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-3">
                <span>
                  <img
                    src={emailIcon}
                    alt="Email Icon"
                    className="w-6 h-4 md:w-7 md:h-5"
                  />
                </span>
                <span className="text-sm md:text-base">EduPath@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <span>
                  <img
                    src={callIcon}
                    alt="Call Icon"
                    className="w-5 h-5 md:w-6 md:h-6"
                  />
                </span>
                <span className="text-sm md:text-base">+08xxxxxxxx</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-6 md:mt-8">
              <h4 className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold">
                Social Media
              </h4>
              <div className="bg-[#417A99] w-[80px] sm:w-[100px] md:w-[120px] h-1 mb-3 md:mb-4 mt-1" />
              <div className="flex space-x-4 md:space-x-6">
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img
                    src={instagramIcon}
                    alt="Instagram Icon"
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                  />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img
                    src={twitterIcon}
                    alt="Twitter Icon"
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
