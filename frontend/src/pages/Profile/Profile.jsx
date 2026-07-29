import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Camera, Save } from 'lucide-react';

function AvatarPreview({ user, file, onFileSelect }) {
  const initial = (user.first_name?.[0] || user.email[0] || '?').toUpperCase();
  const inputRef = useRef(null);

  const previewUrl = file ? URL.createObjectURL(file) : null;
  const colors = ['bg-brand-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'];
  const color = colors[(user.id || 0) % colors.length];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-gray-100">
          {previewUrl || user.avatar ? (
            <img
              src={previewUrl || user.avatar}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full ${color} flex items-center justify-center text-white text-3xl font-bold`}>
              {initial}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer"
        >
          <Camera className="w-7 h-7 text-white" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
          }}
        />
      </div>
      <p className="text-sm text-gray-500">
        Click to {user.avatar || previewUrl ? 'change' : 'upload'} photo
      </p>
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [first_name, setFirstName] = useState(user?.first_name || '');
  const [last_name, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="page-heading mb-4">Please sign in</h1>
        <p className="text-gray-500">You need to be logged in to view this page.</p>
      </div>
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('phone', phone);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const { data } = await client.patch('/auth/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data.user);
      setAvatarFile(null);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="page-heading text-center mb-10">My Profile</h1>

      <form onSubmit={handleSave} className="card-restaurant p-8 space-y-8">
        <AvatarPreview
          user={user}
          file={avatarFile}
          onFileSelect={setAvatarFile}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              className="input-field"
              placeholder="Your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              className="input-field"
              placeholder="Your last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
