'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Schema untuk login dan register
const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, 'Username minimal 3 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function AuthForm({ type, onSubmit }: { type: 'login' | 'register'; onSubmit: (values: LoginFormData | RegisterFormData) => Promise<void> }) {
  const schema = type === 'login' ? loginSchema : registerSchema;

  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: type === 'login' ? { email: '', password: '' } : { username: '', email: '', password: '' },
  });

  async function handleSubmit(values: LoginFormData | RegisterFormData) {
    try {
      await onSubmit(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Username hanya muncul saat register */}
        {type === 'register' && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pengguna</FormLabel>
                <FormControl>
                  <Input placeholder="nama pengguna" autoComplete="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@contoh.com" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" autoComplete={type === 'login' ? 'current-password' : 'new-password'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl">
          {type === 'login' ? 'Masuk' : 'Daftar'}
        </Button>
      </form>
    </Form>
  );
}
