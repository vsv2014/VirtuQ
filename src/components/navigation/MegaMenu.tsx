import { FC } from 'react';
import { Link } from 'react-router-dom';
import { MegaMenuProps } from '../../types/navigation';

export const MegaMenu: FC<MegaMenuProps> = ({ items, onClose }) => {
  return (
    <div className="absolute left-0 w-full bg-white shadow-lg rounded-b-lg py-6">
      <div className="container mx-auto grid grid-cols-4 gap-8">
        {items.map((item, index) => (
          <div key={item.id || index} className="space-y-4">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            {item.children && (
              <ul className="space-y-2">
                {item.children.map((child, childIndex) => (
                  <li key={child.id || childIndex}>
                    <Link
                      to={child.url || '#'}
                      onClick={onClose}
                      className="text-gray-600 hover:text-sky-600"
                    >
                      {child.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
