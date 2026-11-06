import { useState } from 'react';
import { api } from '../api/api.js';
import Avatar from './Avatar.jsx';
import { ErrorBox } from './Feedback.jsx';

// Pick a photo, upload it to Cloudinary through the server, and hand back the link.
export default function ImageField({ label, value, onChange, scorerKey, name }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await api.upload(file, scorerKey);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <Avatar src={value} name={name} size="h-16 w-16" />
        <label className="btn-light cursor-pointer text-sm">
          {busy ? 'Uploading...' : value ? 'Change photo' : 'Choose photo'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} disabled={busy} />
        </label>
        {value && !busy && (
          <button type="button" className="text-sm text-alert underline" onClick={() => onChange('')}>Remove</button>
        )}
      </div>
      <div className="mt-2"><ErrorBox message={error} /></div>
    </div>
  );
}
