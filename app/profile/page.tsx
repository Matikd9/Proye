'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';

const buildInitials = (name?: string | null, email?: string | null) => {
  const candidate = [name, email].find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );

  if (!candidate) return 'U';

  return candidate
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || 'U';
};

type ProfileUpdatePayload = {
  name: string;
  password?: string;
  image?: string;
  deleteImage?: boolean;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? '');
      setIsGoogleAccount(session.user.provider === 'google');
      setImagePreview(session.user.image ?? null);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user?.email) {
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (!data.user || cancelled) {
          return;
        }
        setName(data.user.name ?? '');
        setIsGoogleAccount(data.user.provider === 'google');
        setImagePreview(data.user.image ?? null);
      } catch (error) {
        console.error('Error loading profile data', error);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGoogleAccount) {
      setError(t('profile.googleImageInfo'));
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t('profile.imageTooLarge'));
        return;
      }
      setImageFile(file);
      setDeleteImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [isGoogleAccount, t]);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: ProfileUpdatePayload = { name: name.trim() };
      
      if (password && password.length < 6) {
        setError(t('profile.passwordTooShort'));
        setLoading(false);
        return;
      }
      if (password) payload.password = password;
      
      if (!isGoogleAccount) {
        if (imageFile) payload.image = await toBase64(imageFile);
        if (deleteImage) payload.deleteImage = true;
      }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.message ?? 'Error al actualizar perfil');
      }

      const updated = await res.json();
      
      // Actualizar sesión
      await update?.({
        user: {
          ...(session?.user ?? {}),
          name: updated.user?.name ?? session?.user?.name,
          image: updated.user?.image ?? null,
        },
      });

      setImagePreview(updated.user?.image ?? null);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('profileUpdated', {
            detail: { image: updated.user?.image ?? null, name: updated.user?.name ?? null },
          })
        );
      }

      // Limpiar formulario
      setPassword('');
      setImageFile(null);
      setDeleteImage(false);
      setEditing(false);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t('common.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = () => {
    if (isGoogleAccount) {
      setError(t('profile.cannotDeleteGoogleImage'));
      return;
    }
    setDeleteImage(true);
    setImageFile(null);
    setImagePreview(null);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const profile = session?.user ?? null;

  if (!profile) {
    router.push('/auth/signin');
    return null;
  }

  const initials = buildInitials(profile.name, profile.email);

  const activeAvatar = imagePreview ?? profile.image ?? null;
  const avatarSrc = activeAvatar ?? '/default-avatar.png';
  const avatarIsDataUrl = activeAvatar?.startsWith('data:') ?? false;

  const memberSince = new Date(profile.createdAt ?? Date.now()).toLocaleDateString(
    'es-ES',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {imagePreview || profile.image ? (
                <Image
                  src={avatarSrc}
                  alt="avatar"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                  onError={(event) => {
                    event.currentTarget.src = '/default-avatar.png';
                  }}
                  unoptimized={avatarIsDataUrl}
                  priority
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 ring-4 ring-white shadow-lg flex items-center justify-center text-3xl font-semibold text-primary-700">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">
                {profile.name || profile.email}
              </h1>
              <p className="text-primary-100 flex items-center justify-center sm:justify-start gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {profile.email}
              </p>
            </div>
            <button
              onClick={() => {
                setEditing(!editing);
                setError('');
              }}
              className="px-6 py-2.5 bg-white text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors shadow-md"
            >
              {editing ? 'Cancelar' : t('profile.editProfile')}
            </button>
          </div>
        </div>

        {/* Info Card */}
        {!editing && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('profile.accountInformation')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">{t('profile.username')}</p>
                  <p className="font-medium text-gray-900">{profile.name || 'No especificado'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">{t('profile.memberSince')}</p>
                  <p className="font-medium text-gray-900">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {t('profile.editProfile')}
            </h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>

              {/* Password */}
              {!isGoogleAccount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('common.password')}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Dejar vacío para no cambiar"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 6 caracteres
                  </p>
                </div>
              )}

              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('profile.profilePicture')}
                </label>
                {isGoogleAccount ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    {t('profile.googleImageInfo')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {imagePreview && (
                      <div className="flex items-center gap-4">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-lg object-cover"
                          unoptimized={imagePreview.startsWith('data:')}
                        />
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {t('profile.removeImage')}
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <p className="text-xs text-gray-500">
                      PNG, JPG o GIF (máx. 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Guardando...' : t('common.save')}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setError('');
                    setName(profile?.name ?? '');
                    setPassword('');
                    setImageFile(null);
                    setDeleteImage(false);
                    setImagePreview(profile?.image ?? null);
                  }}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

