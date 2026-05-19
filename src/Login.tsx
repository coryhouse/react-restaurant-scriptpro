import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Field, FieldError, FieldLabel } from "./components/ui/field";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  return (
    <>
      <h1>Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setErrors({}); // Clear any previous errors before validating.
          if (password.length < 6) {
            setErrors((prev) => ({
              ...prev,
              password: "Password must be at least 6 characters long",
            }));
            return;
          }
          console.log(email, password);
        }}
      >
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldError>{errors.password}</FieldError>
        </Field>

        <Button type="submit">Login</Button>
      </form>
    </>
  );
}
