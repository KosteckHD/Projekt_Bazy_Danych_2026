import React, { useState } from "react";
import { registerUser } from "../services/api";
import type { RegisterData } from "../types/api";

type RegisterPageProps = {
  onAuthenticated?: () => void;
};

const optionalValue = (formData: FormData, key: string): string | null => {
  const value = String(formData.get(key) || "").trim();
  return value ? value : null;
};

const RegisterPage: React.FC<RegisterPageProps> = ({ onAuthenticated }) => {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const userData: RegisterData = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      password: String(formData.get("password") || ""),
      driverLicenseNumber: optionalValue(formData, "driverLicenseNumber"),
      driverLicenseExpiresAt: optionalValue(formData, "driverLicenseExpiresAt"),
      birthDate: optionalValue(formData, "birthDate"),
      address: optionalValue(formData, "address"),
    };

    try {
      const session = await registerUser(userData);
      localStorage.setItem("taurus_token", session.token);
      localStorage.setItem("taurus_user", JSON.stringify(session.user));
      onAuthenticated?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie.",
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
              Dołącz do Harvest Motion i rozpocznij wynajem bez wizyty w oddziale.
            </p>
          </div>
        </div>

        <div className="p-margin-mobile md:p-margin-desktop lg:p-12 xl:p-16 flex flex-col justify-center">
          <div className="mb-stack-lg text-center lg:text-left">
            <h1 className="font-headline-md text-headline-md text-on-surface mb-stack-sm">
              Zarejestruj się
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Stwórz konto klienta. Po rejestracji zalogujemy Cię automatycznie.
            </p>
          </div>

          <form className="space-y-stack-lg" onSubmit={handleSubmit}>
            <section>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md flex items-center gap-unit">
                <span className="material-symbols-outlined text-secondary">person</span>
                Dane osobowe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="space-y-stack-sm">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="firstName">
                    Imię
                  </label>
                  <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" id="firstName" name="firstName" placeholder="Jan" required type="text" />
                </div>
                <div className="space-y-stack-sm">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="lastName">
                    Nazwisko
                  </label>
                  <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" id="lastName" name="lastName" placeholder="Kowalski" required type="text" />
                </div>
                <div className="space-y-stack-sm">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
                    Email
                  </label>
                  <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" id="email" name="email" placeholder="jan@example.com" required type="email" />
                </div>
                <div className="space-y-stack-sm">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="phone">
                    Telefon
                  </label>
                  <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" id="phone" name="phone" placeholder="+48123456789" required type="tel" />
                </div>
                <div className="space-y-stack-sm md:col-span-2">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                    Hasło
                  </label>
                  <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" id="password" minLength={8} name="password" placeholder="••••••••" required type="password" />
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md flex items-center gap-unit">
                <span className="material-symbols-outlined text-secondary">badge</span>
                Dane opcjonalne
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" name="driverLicenseNumber" placeholder="Numer prawa jazdy" type="text" />
                <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" name="driverLicenseExpiresAt" type="date" />
                <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" name="birthDate" type="date" />
                <input className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-4 py-3 font-body-md focus:border-primary outline-none" name="address" placeholder="Adres" type="text" />
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
                {submitting ? "Tworzenie konta..." : "Zarejestruj się"}
              </button>
              <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-stack-md">
                Masz już konto?{" "}
                <a className="text-primary hover:underline transition-colors" href="/login">
                  Zaloguj się
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
