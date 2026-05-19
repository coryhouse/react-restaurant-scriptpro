import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Field, FieldError, FieldLabel } from "./components/ui/field";
import { useUser } from "./UserContext";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginField = keyof z.infer<typeof loginSchema>;
type LoginFormErrors = Partial<Record<LoginField, string>>;
type LoginFormTouched = Partial<Record<LoginField, boolean>>;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<LoginFormTouched>({});
  const { setEmail: setUserEmail } = useUser();
  const navigate = useNavigate();

  function validateField(field: LoginField, value: string) {
    const result = loginSchema.shape[field].safeParse(value);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

  return (
    <>
      <h1>Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const result = loginSchema.safeParse({ email, password });
          if (!result.success) {
            const fieldErrors: LoginFormErrors = {};
            for (const issue of result.error.issues) {
              const field = issue.path[0] as LoginField;
              if (field && !fieldErrors[field]) {
                fieldErrors[field] = issue.message;
              }
            }
            setErrors(fieldErrors);
            setTouched({ email: true, password: true });
            return;
          }
          setErrors({});
          setUserEmail(result.data.email);
          navigate({ to: "/" });
        }}
      >
        {Object.values(errors).some(Boolean) && (
          <div
            role="alert"
            aria-labelledby="error-summary-heading"
            className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
          >
            <h2
              id="error-summary-heading"
              className="text-sm font-semibold"
            >
              Please fix the following{" "}
              {Object.values(errors).filter(Boolean).length === 1
                ? "error"
                : "errors"}
              :
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {(Object.entries(errors) as [LoginField, string | undefined][])
                .filter(([, message]) => Boolean(message))
                .map(([field, message]) => (
                  <li key={field}>
                    <a
                      href={`#${field}`}
                      className="underline underline-offset-2 hover:no-underline"
                    >
                      {message}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) validateField("email", e.target.value);
            }}
            onBlur={(e) => {
              setTouched((prev) => ({ ...prev, email: true }));
              validateField("email", e.target.value);
            }}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) validateField("password", e.target.value);
            }}
            onBlur={(e) => {
              setTouched((prev) => ({ ...prev, password: true }));
              validateField("password", e.target.value);
            }}
          />
          <FieldError>{errors.password}</FieldError>
        </Field>

        <Button type="submit">Login</Button>
      </form>
    </>
  );
}
