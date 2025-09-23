"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import type { AuthState } from "./actions";
import { authenticate } from "./actions";

const INITIAL_STATE: AuthState = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" loading={pending}>
      Enter studio
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(authenticate, INITIAL_STATE);

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md border-transparent bg-white/80 backdrop-blur-xl dark:bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-2xl">Grounded Living Studio</CardTitle>
          <CardDescription>Enter the secure admin key to access editorial tools.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Studio admin key</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {state?.message ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {state.message}
              </p>
            ) : null}
            <SubmitButton />
          </form>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The studio is password-protected to prevent unauthorized changes. Environment administrators can rotate the
            <code className="mx-1 rounded bg-slate-900/5 px-1 py-0.5 text-[10px] uppercase tracking-wide dark:bg-slate-50/10">STUDIO_ADMIN_KEY</code>
            at any time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
