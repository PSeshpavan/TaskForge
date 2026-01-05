import React, { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import type { ApiError } from "../../../lib/apiClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const loc = useLocation();
  const { mutateAsync, isPending, error } = useLogin();

  const from = (loc.state as any)?.from?.pathname || "/boards";
  const err = error as ApiError | undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mutateAsync({ email, password });
      navigate(from, { replace: true });
    } catch {}
  }

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Welcome back</p>
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {err && <p className="text-xs text-rose-400">{err.data?.message || err.message}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="text-sm text-slate-400">
        Need an account?{" "}
        <Link to="/register" className="text-sky-400 hover:underline">
          Create one.
        </Link>
      </p>
    </Card>
  );
}
