'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RiErrorWarningFill } from '@remixicon/react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircleIcon } from 'lucide-react';
import { Icons } from '@/components/common/icons';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

export default function Page() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: 'demo@kt.com',
      password: 'demo123',
      rememberMe: false,
    },
  });

  async function onSubmit(values: any) {
    setIsProcessing(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setIsProcessing(false);
    }
  }

  const handleGoogleSignin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err) {
      setError('Google sign-in failed');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block w-full space-y-5"
      >
        <div className="space-y-1.5 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Sign in to Metronic
          </h1>
        </div>

        <Alert size="sm" close={false}>
          <AlertIcon>
            <RiErrorWarningFill className="text-primary" />
          </AlertIcon>
          <AlertTitle className="text-accent-foreground">
            Use <span className="text-mono font-semibold">demo@kt.com</span>{' '}
            username and{' '}
            <span className="text-mono font-semibold">demo123</span> for demo
            access.
          </AlertTitle>
        </Alert>

        <div className="flex flex-col gap-3.5">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignin}
          >
            <Icons.googleColorful className="size-5! opacity-100!" /> Sign in
            with Google
          </Button>
        </div>

        <div className="relative py-1.5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
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
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/reset-password"
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="Your password"
                  type={passwordVisible ? 'text' : 'password'}
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                  aria-label={
                    passwordVisible ? 'Hide password' : 'Show password'
                  }
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <>
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm leading-none text-muted-foreground"
                >
                  Remember me
                </label>
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
            Continue
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </Form>
  );
}