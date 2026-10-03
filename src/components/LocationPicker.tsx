import { useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Check } from 'lucide-react';

import { useLocation } from '../context/useLocation';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

/**
 * Lets the shopper set the delivery location, which the header then shows.
 * `setLocation` was previously never called by anything.
 */
export function LocationPicker() {
  const { location, setLocation, clear } = useLocation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const ref = useOnClickOutside<HTMLDivElement>(() => setOpen(false), open);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    setLocation(value);
    setValue('');
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex max-w-[180px] items-center gap-1 rounded-full px-2 py-1 text-sm hover:bg-gray-100"
      >
        <MapPin className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{location ?? 'Set delivery location'}</span>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 w-64 rounded-lg bg-white p-3 shadow-lg ring-1 ring-black/5">
          <form onSubmit={handleSubmit}>
            <label htmlFor="location-input" className="field-label">
              Pincode or city
            </label>
            <input
              id="location-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="e.g. 560001"
              className="field-input"
            />
            <button type="submit" className="btn btn-primary mt-2 w-full py-2">
              <Check className="h-4 w-4" />
              Save location
            </button>
          </form>

          {location ? (
            <button
              type="button"
              onClick={() => {
                clear();
                setOpen(false);
              }}
              className="mt-2 w-full text-xs text-gray-500 hover:text-red-600"
            >
              Remove location
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
