"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { Alert, AlertIcon, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoaderCircleIcon } from "lucide-react";
import { Icons } from "@/components/common/icons";
import { useAuth } from "@/providers/auth-context";

export default function Page() {
  const { signup, signInWithGoogle, isLoading } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      role: "coach" as 'coach' | 'athlete',
      accept: false,
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await form.trigger();
    if (!result) return;
    
    try {
      const { email, password, name} = form.getValues();
      setError(null);
      await signup(email, password, name);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed";
      setError(errorMessage);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Google sign-in failed";
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <Alert onClose={() => setSuccess(false)}>
        <AlertIcon>
          <Check />
        </AlertIcon>
        <AlertTitle>
          You have successfully signed up! Please check your email to verify your account and then {" "}
          <Link href="/sign-in/" className="text-primary hover:text-primary-darker">
            Log in
          </Link>
          .
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <Suspense>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="block w-full space-y-5">
          <div className="space-y-1.5 pb-3">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign Up to Metronic
            </h1>
          </div>

          <div className="flex flex-col gap-3.5">
            <Button variant="outline" type="button" onClick={handleGoogleSignup}>
              <Icons.googleColorful className="size-4!" /> Sign up with Google
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
            <Alert variant="destructive" onClose={() => setError(null)}>
              <AlertIcon>
                <AlertCircle />
              </AlertIcon>
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <Input
                  placeholder="Your password"
                  type={passwordVisible ? "text" : "password"}
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? <EyeOff className="text-muted-foreground" /> : <Eye className="text-muted-foreground" />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="passwordConfirmation" render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <Input
                  type={passwordConfirmationVisible ? "text" : "password"}
                  {...field}
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  onClick={() => setPasswordConfirmationVisible(!passwordConfirmationVisible)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                  aria-label={
                    passwordConfirmationVisible
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                >
                  {passwordConfirmationVisible ? <EyeOff className="text-muted-foreground" /> : <Eye className="text-muted-foreground" />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex items-center space-x-2">
            <FormField control={form.control} name="accept" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-2.5">
                    <Checkbox id="accept" checked={field.value} onCheckedChange={(checked) => field.onChange(!!checked)} />
                    <label htmlFor="accept" className="text-sm leading-none text-muted-foreground">
                      I agree to the
                    </label>
                    <Link href="/privacy-policy" target="_blank" className="-ms-0.5 text-sm font-semibold text-foreground hover:text-primary">
                      Privacy Policy
                    </Link>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="flex flex-col gap-2.5">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
              Continue
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Already have an account? {" "}
            <Link href="/signin" className="text-sm font-semibold text-foreground hover:text-primary">
              Sign In
            </Link>
          </div>
        </form>
      </Form>
    </Suspense>
  );
}
