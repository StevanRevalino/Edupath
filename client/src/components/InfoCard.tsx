import React from "react";

interface InfoCardProps {
  img: string;
  title: string;
  desc: string;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  img,
  title,
  desc,
  className = "",
}) => {
  return (
    <div className={`text-center px-2 ${className}`}>
      <img
        src={img}
        alt={title}
        className="mx-auto w-24 h-24 md:w-32 md:h-32 object-contain"
        loading="lazy"
        decoding="async"
      />
      <h4 className="mt-4 font-extrabold text-primary-dark">{title}</h4>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
};

export default InfoCard;
