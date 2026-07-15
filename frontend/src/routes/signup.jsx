import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthShell, FieldLabel, TextInput, PrimaryButton } from "@/components/auth-shell";

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      // TODO: wire to auth backend
      navigate("/dashboard");
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracing answers back to their source."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block">
          <FieldLabel>Name</FieldLabel>
          <TextInput
            type="text"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoComplete="name"
            required
          />
        </label>
        <label className="block">
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
        </label>
        <label className="block">
          <FieldLabel>Password</FieldLabel>
          <TextInput
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            required
          />
        </label>
        <PrimaryButton type="submit">Create account</PrimaryButton>
      </form>
    </AuthShell>
  );
}
