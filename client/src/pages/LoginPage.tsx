import React, { useState } from "react";
import { loginUser } from "../services/api";

type LoginPageProps = {
  onAuthenticated?: () => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const session = await loginUser({
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
      });

      localStorage.setItem("taurus_token", session.token);
      localStorage.setItem("taurus_user", JSON.stringify(session.user));
      onAuthenticated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop bg-background">
      <div className="w-full max-w-container-max mx-auto bg-surface-container-lowest rounded-[1.5rem] border border-surface-variant shadow-sm shadow-secondary/10 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:block relative h-full bg-secondary">
          <img
            alt="Widok drogi"
            className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOPc7cy7sJW8XJfk5rGSDuKsEfyen5Ja_y1kHoQx696_yKq491okby9miMikGlM6n41sCO41BBia-fyuKOz-Gknl7PfCa_3atQ-qMCX69OZ3Z4G7maKBsq1z6-L16wqpSjQ0-kjfvaEdZUnuQhhZEp3MN5eG0y6N-Vr5mAi9Jyup3I56GpSoy5Gk0mJ3Wo9170u1sHxV0GXDQDeyqCCLd4eTLSbFxNwimriKjaOeP2s3s-VqBniOrNFIWi-pIENzP9FT5ng0T9to-q"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent flex flex-col justify-end p-margin-desktop text-on-secondary">
            <h2 className="font-headline-md text-headline-md mb-stack-sm">
              Harvest Motion
            </h2>
            <p className="font-body-lg text-body-lg text-on-secondary/90 max-w-md">
              Twoja podróż czeka. Zaloguj się, aby kontynuować.
            </p>
          </div>
        </div>

        <div className="p-margin-mobile md:p-margin-desktop lg:p-12 xl:p-16 flex flex-col justify-center">
          <div className="mb-stack-lg text-center lg:text-left">
            <h1 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">
              Zaloguj się
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Wprowadź swoje dane, aby uzyskać dostęp do konta.
            </p>
          </div>

          <form className="space-y-stack-lg" onSubmit={handleSubmit}>
            <section>
              <div className="grid grid-cols-1 gap-gutter">
                <div className="space-y-stack-sm">
                  <label
                    className="block font-label-md text-label-md text-on-surface"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none"
                    id="email"
                    name="email"
                    placeholder="jan@example.com"
                    required
                    type="email"
                  />
                </div>
                <div className="space-y-stack-sm">
                  <label
                    className="block font-label-md text-label-md text-on-surface"
                    htmlFor="password"
                  >
                    Hasło
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none"
                    id="password"
                    minLength={8}
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-error/30 bg-error-container/20 p-3 text-sm text-error">
                {error}
              </div>
            )}

            <div className="pt-stack-md">
              <button
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 px-6 rounded-lg shadow-sm border-b-2 border-primary-container hover:bg-primary/90 transition-all disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Logowanie..." : "Zaloguj się"}
              </button>
              <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-stack-md">
                Nie masz konta?{" "}
                <a className="text-primary hover:underline transition-colors" href="/register">
                  Zarejestruj się
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
