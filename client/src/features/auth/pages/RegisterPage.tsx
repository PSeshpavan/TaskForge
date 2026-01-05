import React, { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import type { ApiError } from "../../../lib/apiClient";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { mutateAsync, error, isPending } = useRegister();

  const err = error as ApiError | undefined;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mutateAsync({ name, email, password });
      navigate("/boards", { replace: true });
    } catch {}
  }

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">New here?</p>
        <h1 className="text-2xl font-semibold text-white">Create an account</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Name" value={name} onChange={setName} placeholder="Your name" />
        <Input label="Email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        {err && <p className="text-xs text-rose-400">{err.data?.message || err.message}</p>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-slate-400">
        Already registered?{" "}
        <Link to="/login" className="text-sky-400 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
