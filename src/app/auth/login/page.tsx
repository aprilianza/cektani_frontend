'use client'

import { AuthCard } from '@/components/auth/auth-card'
import { AuthForm } from '@/components/auth/auth-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await loginUser(values.email, values.password)
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <AuthCard title="Masuk ke CekTani">
      <AuthForm type="login" onSubmit={handleLogin} />
      <div className="mt-4 text-center text-sm">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="text-green-600 hover:underline">
          Daftar disini
        </Link>
      </div>
    </AuthCard>
  )
}
