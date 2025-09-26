import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../Icons';

interface SpinnerMenuItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  angle: number;
  disabled?: boolean;
}

interface SpinnerContextMenuProps {
  items: SpinnerMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

const SpinnerContextMenu: React.FC<SpinnerContextMenuProps> = ({
  items,
  position,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const radius = 80;
  const centerX = 0;
  const centerY = 0;

  console.log('SpinnerContextMenu position received:', position);

  const spinnerContent = (
    <div
      ref={menuRef}
      className={`fixed z-[9999] transition-all duration-200 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{
        left: position.x - radius,
        top: position.y - radius,
        width: radius * 2,
        height: radius * 2,
        pointerEvents: 'auto',
      }}
    >
      {/* Center circle */}
      <div
        className="absolute bg-black border-2 border-gray-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
        style={{
          left: radius - 20,
          top: radius - 20,
          width: 40,
          height: 40,
        }}
        onClick={onClose}
      >
        <Icons.ByName name="close" className="w-6 h-6 text-white" />
      </div>

      {/* Menu items around the circle */}
      {items.map((item, index) => {
        const angle = (item.angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle) + radius - 20;
        const y = centerY + radius * Math.sin(angle) + radius - 20;

                return (
          <div
            key={item.id}
            className={`absolute border rounded-full flex items-center justify-center transition-all duration-150 ${
              item.disabled
                ? 'bg-gray-800 border-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gray-700 border-gray-500 cursor-pointer hover:bg-gray-600 hover:scale-110'
            }`}
            style={{
              left: x,
              top: y,
              width: 40,
              height: 40,
            }}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            title={item.disabled ? `${item.label} (Not Available)` : item.label}
          >
            <Icons.ByName
              name={item.icon}
              className={`w-7 h-7 ${item.disabled ? 'text-gray-500' : 'text-white'}`}
            />
          </div>
        );
      })}

      {/* Connection lines from center to items */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={radius * 2}
        height={radius * 2}
        style={{ opacity: 0.3 }}
      >
        {items.map((item, index) => {
          const angle = (item.angle * Math.PI) / 180;
          const x1 = radius;
          const y1 = radius;
          const x2 = radius + (radius - 20) * Math.cos(angle);
          const y2 = radius + (radius - 20) * Math.sin(angle);

          return (
            <line
              key={`line-${item.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={item.disabled ? "#444" : "#666"}
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity={item.disabled ? 0.3 : 0.6}
            />
          );
        })}
      </svg>
    </div>
  );

  return createPortal(spinnerContent, document.body);
};

export default SpinnerContextMenu;
