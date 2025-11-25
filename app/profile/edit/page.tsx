import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import User from '@/models/User';
import authConfig from '../../api/auth/[...nextauth]/config';
import { EditProfileForm } from '../EditProfileForm';

export default async function EditProfilePage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <EditProfileForm
        initialData={{
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          provider: user.provider,
        }}
      />
    </div>
  );
}

