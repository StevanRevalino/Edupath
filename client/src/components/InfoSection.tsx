import React from "react";
import InfoCard from "./InfoCard";

interface InfoItem {
  img: string;
  title: string;
  desc: string;
}

interface InfoSectionProps {
  title: string;
  items: InfoItem[];
  className?: string;
}

const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  items,
  className = "",
}) => {
  return (
    <section
      className={`relative px-[52px] md:px-[120px] lg:px-[180px] xl:px-[240px] pt-8 sm:pt-80 lg:pt-[520px] pb-6 ${className}`}
    >
      <div
        className="relative rounded-[24px] bg-secondary-lighter backdrop-blur-[1px]
                px-5 py-6 md:px-8 md:py-8 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      >
        {/* Corner Accents */}
        <div
          className="pointer-events-none absolute -top-6 -left-6 h-12 w-12
                  border-t-2 border-l-2 border-primary-dark rounded-tl-[20px]"
        />
        <div
          className="pointer-events-none absolute -bottom-6 -right-6 h-12 w-12
                  border-b-2 border-r-2 border-primary-dark rounded-br-[20px]"
        />

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-extrabold text-center text-black mb-8">
          {title}
        </h3>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {items.map((item, index) => (
            <InfoCard
              key={index}
              img={item.img}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
