import { useState } from 'react';
import type { FormEvent } from 'react';
import { MapPin, Trash2, Plus } from 'lucide-react';

import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { getErrorMessage } from '../lib/api';
import type { Address } from '../types';

const EMPTY: Omit<Address, 'id'> = {
  name: '',
  phone: '',
  pincode: '',
  city: '',
  state: '',
  locality: '',
  building: '',
  landmark: '',
  type: 'home',
  isDefault: false,
};

export function AddressBook() {
  const { user, addAddress, removeAddress } = useAuth();
  const { show } = useToast();

  const [form, setForm] = useState<Omit<Address, 'id'>>(EMPTY);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addresses = user?.addresses ?? [];

  const update = <K extends keyof Omit<Address, 'id'>>(
    field: K,
    value: Omit<Address, 'id'>[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const missing = (
      ['name', 'phone', 'pincode', 'city', 'state', 'locality', 'building'] as const
    ).filter((field) => !String(form[field] ?? '').trim());

    if (missing.length > 0) {
      setError('Please complete every required field');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Enter a valid 6-digit pincode');
      return;
    }

    setBusy(true);
    try {
      await addAddress(form);
      setForm(EMPTY);
      setAdding(false);
      show('Address saved', 'success');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeAddress(id);
      show('Address removed', 'success');
    } catch (err) {
      show(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Addresses</h1>
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add address
          </button>
        ) : null}
      </div>

      {adding ? (
        <form
          onSubmit={handleAdd}
          className="mb-8 space-y-4 rounded-lg bg-white p-6 shadow-sm"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="addr-name" className="field-label">
                Full name
              </label>
              <input
                id="addr-name"
                className="field-input"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="addr-phone" className="field-label">
                Phone
              </label>
              <input
                id="addr-phone"
                inputMode="numeric"
                className="field-input"
                value={form.phone}
                onChange={(event) =>
                  update('phone', event.target.value.replace(/\D/g, '').slice(0, 10))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="addr-pincode" className="field-label">
                Pincode
              </label>
              <input
                id="addr-pincode"
                inputMode="numeric"
                className="field-input"
                value={form.pincode}
                onChange={(event) =>
                  update('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))
                }
              />
            </div>
            <div>
              <label htmlFor="addr-city" className="field-label">
                City
              </label>
              <input
                id="addr-city"
                className="field-input"
                value={form.city}
                onChange={(event) => update('city', event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="addr-state" className="field-label">
                State
              </label>
              <input
                id="addr-state"
                className="field-input"
                value={form.state}
                onChange={(event) => update('state', event.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="addr-locality" className="field-label">
              Locality / Area
            </label>
            <input
              id="addr-locality"
              className="field-input"
              value={form.locality}
              onChange={(event) => update('locality', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="addr-building" className="field-label">
              Flat / House No., Building
            </label>
            <input
              id="addr-building"
              className="field-input"
              value={form.building}
              onChange={(event) => update('building', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="addr-landmark" className="field-label">
              Landmark (optional)
            </label>
            <input
              id="addr-landmark"
              className="field-input"
              value={form.landmark ?? ''}
              onChange={(event) => update('landmark', event.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault ?? false}
              onChange={(event) => update('isDefault', event.target.checked)}
              className="rounded text-purple-600"
            />
            Make this my default address
          </label>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save address'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setAdding(false);
                setForm(EMPTY);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {addresses.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <MapPin className="mx-auto mb-4 h-10 w-10 text-gray-300" />
          <h2 className="mb-2 text-lg font-semibold">No saved addresses</h2>
          <p className="text-gray-600">
            Add an address to speed up checkout next time.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex items-start justify-between gap-4 rounded-lg bg-white p-6 shadow-sm"
            >
              <div>
                <p className="font-medium">
                  {address.name}
                  {address.isDefault ? (
                    <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                      Default
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-gray-600">
                  {address.building}, {address.locality}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-sm text-gray-600">Phone: {address.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => address.id && handleRemove(address.id)}
                aria-label={`Delete address for ${address.name}`}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
