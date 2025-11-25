'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from './supabase';
import { z } from 'zod';

/**
 * Schema de validação para login
 */
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

/**
 * Schema de validação para registro
 */
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

/**
 * Action para fazer login
 */
export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validar dados
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      error: result.error.issues[0].message,
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: 'Email ou senha incorretos',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

/**
 * Action para fazer registro
 */
export async function register(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  // Validar dados
  const result = registerSchema.safeParse({ email, password, name });
  if (!result.success) {
    return {
      error: result.error.issues[0].message,
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    return {
      error: 'Erro ao criar conta. Tente novamente.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

/**
 * Action para fazer logout
 */
export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Action para resetar senha
 */
export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;

  if (!email || !z.string().email().safeParse(email).success) {
    return {
      error: 'Email inválido',
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return {
      error: 'Erro ao enviar email de recuperação',
    };
  }

  return {
    success: 'Email de recuperação enviado! Verifique sua caixa de entrada.',
  };
}

/**
 * Action para atualizar senha
 */
export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;

  if (!password || password.length < 6) {
    return {
      error: 'Senha deve ter no mínimo 6 caracteres',
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      error: 'Erro ao atualizar senha',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
