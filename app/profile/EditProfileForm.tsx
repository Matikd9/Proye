'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export type ProfileData = {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'credentials' | 'google';
};

type Props = {
  initialData: ProfileData;
};

const initialsFromName = (value: string) => {
  const clean = value.trim();
  if (!clean) return 'EV';
  const parts = clean.split(' ').filter(Boolean);
  if (!parts.length) return clean.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export function EditProfileForm({ initialData }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const { locale } = useLanguage();
  const [name, setName] = useState(initialData.name);
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData.image);
  const [imageData, setImageData] = useState<string | undefined>();
  const [removeImage, setRemoveImage] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setError(t('profile.messages.imageTooLarge', locale));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageData(result);
      setRemoveImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(undefined);
    setImageData(undefined);
    setRemoveImage(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('saving');
    setError(null);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = { name };
      if (initialData.provider === 'credentials') {
        if (imageData) {
          payload.imageData = imageData;
        }
        if (removeImage) {
          payload.removeImage = true;
        }
        if (newPassword) {
          payload.currentPassword = currentPassword;
          payload.newPassword = newPassword;
          payload.confirmPassword = confirmPassword;
        }
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'No se pudo actualizar el perfil');
      }

      setMessage(t('profile.messages.updateSuccess', locale));
      setStatus('idle');
      setImageData(undefined);
      setRemoveImage(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (result.image !== undefined) {
        setImagePreview(result.image);
      }
      await update?.({
        name: result.name,
        image: result.image,
      });
      router.refresh();
    } catch (err) {
      setStatus('idle');
      const errorMessage = err instanceof Error ? err.message : t('profile.messages.unknownError', locale);
      setError(errorMessage);
    }
  };

  const canEditMedia = initialData.provider === 'credentials';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-500">{t('profile.edit.badge', locale)}</p>
        <h1 className="text-3xl font-black text-gray-900">{t('profile.edit.title', locale)}</h1>
        <p className="text-sm text-gray-500">{t('profile.edit.subtitle', locale)}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t('profile.edit.basicInfoTitle', locale)}</h2>
          <p className="text-sm text-gray-500">{t('profile.edit.basicInfoSubtitle', locale)}</p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">{t('profile.edit.nameLabel', locale)}</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              minLength={2}
              maxLength={80}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">{t('profile.edit.emailLabel', locale)}</span>
            <input
              type="email"
              value={initialData.email}
              disabled
              className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-500"
            />
          </label>
        </div>
      </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('profile.edit.photoTitle', locale)}</h2>
            <p className="text-sm text-gray-500">
              {t(
                canEditMedia ? 'profile.edit.photoHintCredentials' : 'profile.edit.photoHintGoogle',
                locale
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt={name}
              width={96}
              height={96}
              className="h-24 w-24 rounded-3xl object-cover border border-gray-100"
            />
          ) : (
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white flex items-center justify-center text-3xl font-black">
              {initialsFromName(name)}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <label className={`inline-flex items-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              canEditMedia
                ? 'cursor-pointer border border-primary-200 text-primary-700 hover:bg-primary-50'
                : 'cursor-not-allowed border border-gray-200 text-gray-400'
            }`}>
              {t('profile.edit.photoUpload', locale)}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={!canEditMedia}
              />
            </label>
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={!canEditMedia || (!imagePreview && !imageData)}
              className="inline-flex items-center rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              {t('profile.edit.photoRemove', locale)}
            </button>
          </div>
        </div>
        </section>

        {canEditMedia && (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('profile.edit.passwordTitle', locale)}</h2>
            <p className="text-sm text-gray-500">{t('profile.edit.passwordSubtitle', locale)}</p>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">{t('profile.edit.currentPassword', locale)}</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="••••••••"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">{t('profile.edit.newPassword', locale)}</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Al menos 6 caracteres"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-gray-700">{t('profile.edit.confirmPassword', locale)}</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="Debe coincidir"
                />
              </label>
            </div>
          </div>
          </section>
        )}

        {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
        )}

        <div className="flex flex-wrap gap-3">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          {t('profile.edit.cancel', locale)}
        </Link>
        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-60"
        >
          {status === 'saving' ? t('profile.edit.saving', locale) : t('profile.edit.save', locale)}
        </button>
        </div>
      </form>
    </div>
  );
}
