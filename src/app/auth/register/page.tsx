'use client';

import { AuthCard } from '@/components/auth/auth-card';
import { AuthForm } from '@/components/auth/auth-form';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';
import { toast } from 'sonner';

export default function RegisterPage() {
  const handleRegister = async (values: { email: string; password: string; username?: string }) => {
    try {
      if (!values.username) {
        throw new Error('Username tidak boleh kosong');
      }
      await registerUser(values.username, values.email, values.password);
      toast.success('Berhasil daftar, silakan login');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Terjadi kesalahan');
      }
    }
  };

  return (
    <AuthCard title="Daftar ke CekTani">
      <AuthForm type="register" onSubmit={handleRegister} />
      <div className="mt-4 text-center text-sm">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="text-green-600 hover:underline">
          Masuk disini
        </Link>
      </div>
    </AuthCard>
  );
}
