import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Home, Building2, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import { useOrder } from '../context/useOrder';
import { useToast } from '../context/useToast';
import { getErrorMessage } from '../lib/api';
import { computeTotals, formatINR } from '../lib/format';
import { Spinner } from './Spinner';
import type { Address } from '../types';

type AddressField = keyof Address;
type Errors = Partial<Record<AddressField | 'terms' | 'identity', string>>;

const EMPTY_ADDRESS: Address = {
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

const REQUIRED: { field: AddressField; label: string }[] = [
  { field: 'name', label: 'Full name' },
  { field: 'phone', label: 'Phone number' },
  { field: 'pincode', label: 'Pincode' },
  { field: 'city', label: 'City' },
  { field: 'state', label: 'State' },
  { field: 'locality', label: 'Locality' },
  { field: 'building', label: 'Building' },
];

function validate(address: Address): Errors {
  const errors: Errors = {};

  for (const { field, label } of REQUIRED) {
    if (!String(address[field] ?? '').trim()) {
      errors[field] = `${label} is required`;
    }
  }

  if (address.phone && !/^[6-9]\d{9}$/.test(address.phone)) {
    errors.phone = 'Enter a valid 10-digit mobile number';
  }
  if (address.pincode && !/^\d{6}$/.test(address.pincode)) {
    errors.pincode = 'Enter a valid 6-digit pincode';
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert">
      {message}
    </p>
  );
}

export function Checkout() {
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const { user } = useAuth();
  const { createOrder, pending } = useOrder();
  const { show } = useToast();

  const savedDefault = useMemo(
    () => user?.addresses.find((address) => address.isDefault) ?? user?.addresses[0],
    [user],
  );

  const [address, setAddress] = useState<Address>(() => ({
    ...EMPTY_ADDRESS,
    ...(savedDefault ?? {}),
  }));
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const totals = computeTotals(items);
  const submitting = pending === 'createOrder';

  const update = <K extends AddressField>(field: K, value: Address[K]) => {
    setAddress((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validate(address);
    if (!termsAccepted) nextErrors.terms = 'Please accept the terms and conditions';
    if (!identityConfirmed) {
      nextErrors.identity = 'Please confirm the identity check';
    }

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    if (items.length === 0) {
      show('Your cart is empty', 'error');
      return;
    }

    try {
      const order = await createOrder(
        items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        address,
      );

      clear();
      show('Order placed! Your trial starts on delivery.', 'success');
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (error) {
      show(getErrorMessage(error), 'error');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">Nothing to check out</h2>
        <p className="mb-8 text-gray-600">
          Add a few pieces to your bag and your home trial can start.
        </p>
        <Link to="/" className="btn btn-primary">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 flex items-center text-lg font-semibold">
                <MapPin className="mr-2 h-5 w-5" />
                Delivery Address
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    className="field-input"
                    value={address.name}
                    onChange={(event) => update('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                  />
                  <FieldError message={errors.name} />
                </div>

                <div>
                  <label className="field-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    className="field-input"
                    value={address.phone}
                    onChange={(event) =>
                      update(
                        'phone',
                        event.target.value.replace(/\D/g, '').slice(0, 10),
                      )
                    }
                    aria-invalid={Boolean(errors.phone)}
                  />
                  <FieldError message={errors.phone} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="field-label" htmlFor="pincode">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    inputMode="numeric"
                    className="field-input"
                    value={address.pincode}
                    onChange={(event) =>
                      update(
                        'pincode',
                        event.target.value.replace(/\D/g, '').slice(0, 6),
                      )
                    }
                    aria-invalid={Boolean(errors.pincode)}
                  />
                  <FieldError message={errors.pincode} />
                </div>

                <div>
                  <label className="field-label" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    className="field-input"
                    value={address.city}
                    onChange={(event) => update('city', event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                  />
                  <FieldError message={errors.city} />
                </div>

                <div>
                  <label className="field-label" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    className="field-input"
                    value={address.state}
                    onChange={(event) => update('state', event.target.value)}
                    aria-invalid={Boolean(errors.state)}
                  />
                  <FieldError message={errors.state} />
                </div>
              </div>

              <div className="mt-4">
                <label className="field-label" htmlFor="locality">
                  Locality / Area
                </label>
                <input
                  id="locality"
                  className="field-input"
                  value={address.locality}
                  onChange={(event) => update('locality', event.target.value)}
                  aria-invalid={Boolean(errors.locality)}
                />
                <FieldError message={errors.locality} />
              </div>

              <div className="mt-4">
                <label className="field-label" htmlFor="building">
                  Flat / House No., Building
                </label>
                <input
                  id="building"
                  className="field-input"
                  value={address.building}
                  onChange={(event) => update('building', event.target.value)}
                  aria-invalid={Boolean(errors.building)}
                />
                <FieldError message={errors.building} />
              </div>

              <div className="mt-4">
                <label className="field-label" htmlFor="landmark">
                  Landmark (Optional)
                </label>
                <input
                  id="landmark"
                  className="field-input"
                  value={address.landmark ?? ''}
                  onChange={(event) => update('landmark', event.target.value)}
                />
              </div>

              <fieldset className="mt-4">
                <legend className="field-label">Address Type</legend>
                <div className="flex gap-4">
                  {(
                    [
                      { value: 'home', label: 'Home', Icon: Home },
                      { value: 'office', label: 'Office', Icon: Building2 },
                    ] as const
                  ).map(({ value, label, Icon }) => (
                    <label key={value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="addressType"
                        value={value}
                        checked={address.type === value}
                        onChange={() => update('type', value)}
                        className="text-purple-600"
                      />
                      <span className="flex items-center">
                        <Icon className="mr-1 h-4 w-4" /> {label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </motion.div>

            {/* Identity check: an explicit acknowledgement, not a fake button. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <h2 className="mb-2 flex items-center text-lg font-semibold">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Identity Check
              </h2>
              <p className="mb-4 text-gray-600">
                For your security, our delivery partner verifies a government ID at the
                door before handing over your trial items.
              </p>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={identityConfirmed}
                  onChange={(event) => {
                    setIdentityConfirmed(event.target.checked);
                    setErrors((current) => ({ ...current, identity: undefined }));
                  }}
                  className="mt-1 rounded text-purple-600"
                />
                <span className="text-sm text-gray-700">
                  I understand I need to show ID at delivery
                </span>
              </label>
              <FieldError message={errors.identity} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-fit rounded-lg bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                    <span className="block text-xs text-gray-500">
                      {item.size} / {item.color}
                    </span>
                  </span>
                  <span>{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}

              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>{formatINR(totals.gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Handling Fee</span>
                  <span>{formatINR(totals.handlingFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatINR(totals.total)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked);
                      setErrors((current) => ({ ...current, terms: undefined }));
                    }}
                    className="mt-1 rounded text-purple-600"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-purple-600 hover:underline">
                      terms of service
                    </Link>{' '}
                    and privacy policy
                  </span>
                </label>
                <FieldError message={errors.terms} />

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full"
                >
                  {submitting ? (
                    <Spinner className="py-0" />
                  ) : (
                    <>
                      <Clock className="h-5 w-5" />
                      Place Order for Home Trial
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-600">
                  Your 2-hour trial period will start after delivery
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
