import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { User, Save } from 'lucide-react';

import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { getErrorMessage } from '../lib/api';

export function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { show } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({ name, email });
      show('Profile updated', 'success');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Profile</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg bg-white p-6 shadow-sm"
        noValidate
      >
        <div className="flex items-center gap-3 border-b pb-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <User className="h-6 w-6" />
          </span>
          <div>
            <p className="font-medium">+91 {user?.phone}</p>
            <p className="text-sm text-gray-500">Verified mobile number</p>
          </div>
        </div>

        <div>
          <label htmlFor="profile-name" className="field-label">
            Full name
          </label>
          <input
            id="profile-name"
            className="field-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="profile-email" className="field-label">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            className="field-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link to="/address" className="btn btn-secondary">
          Manage addresses
        </Link>
        <Link to="/orders" className="btn btn-secondary">
          My orders
        </Link>
        <button type="button" onClick={logout} className="btn btn-ghost">
          Log out
        </button>
      </div>
    </div>
  );
}
