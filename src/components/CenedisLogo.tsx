import React from 'react';

interface CenedisLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const CenedisLogo: React.FC<CenedisLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official CENEDIS LunaSol Logo Image */}
      <img
        src="/assets/aistudio/CENEDIS_2023_af3c271b.jpg"
        alt="Logo Institucional CENEDIS LunaSol"
        width={size}
        height={size}
        className="rounded-full object-contain shrink-0 shadow-2xs"
        style={{ width: `${size}px`, height: `${size}px` }}
      />

      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
            CENEDIS <span className="text-amber-600 font-extrabold">LunaSol</span>
          </span>
          <span className="text-[10px] text-emerald-800 font-medium tracking-wide mt-0.5">
            Educación para el ser, salud para el futuro
          </span>
        </div>
      )}
    </div>
  );
};
