import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { BrandLogo } from '../components/shared/BrandLogo';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { cn } from '../lib/utils';

const loginSchema = z.object({
  email: z.string().email('Informe um email válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

type LoginForm = z.infer<typeof loginSchema>;

type SubmitStatus = 'idle' | 'loading';

export function Login() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginForm) => {
    if (!isFirebaseConfigured || !auth) {
      setSubmitError('Firebase não configurado. Defina as variáveis de ambiente.');
      return;
    }
    setStatus('loading');
    setSubmitError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate('/admin');
    } catch (error) {
      setSubmitError('Credenciais inválidas ou acesso não autorizado.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-8 h-52 w-52 rounded-full bg-accent/60 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-secondary/60 blur-3xl" />
        </div>

        <header className="relative flex items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo className="h-9" />
            <span className="sr-only">Nova Solidum Finances</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">Voltar ao site</Link>
          </Button>
        </header>

        <main className="relative flex min-h-[calc(100vh-96px)] items-center justify-center px-6 pb-10">
          <Card className="w-full max-w-md border-border/70 bg-white/90 p-8 shadow-card backdrop-blur">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">Acesso Administrativo</h1>
              <p className="text-sm text-muted-foreground">
                Entre com suas credenciais para acompanhar os registros do onboarding.
              </p>
            </div>

            {!isFirebaseConfigured ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                Configure as variáveis <span className="font-semibold">VITE_FIREBASE_*</span> para liberar o login.
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@novasolidum.com.br"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
              </div>

              {submitError ? <p className="text-xs text-rose-600">{submitError}</p> : null}

              <Button
                type="submit"
                className={cn('w-full', status === 'loading' && 'pointer-events-none opacity-80')}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <span>Precisa de acesso?</span>{' '}
              <a href="mailto:contato@novasolidum.com.br" className="font-medium text-primary">
                Fale com o suporte
              </a>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
