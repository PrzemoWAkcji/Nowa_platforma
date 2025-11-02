"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types";
import { Eye, EyeOff, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import React, { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: UserRole;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, isLoading } = useAuthStore();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: UserRole.ATHLETE,
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(loginData.email, loginData.password);
      onClose();
      // Reset formularza
      setLoginData({ email: "", password: "" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Błąd logowania");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (registerData.password !== registerData.confirmPassword) {
      setError("Hasła nie są identyczne!");
      return;
    }

    try {
      const { confirmPassword: _confirmPassword, ...registerPayload } =
        registerData;
      await register(registerPayload);
      onClose();
      // Reset formularza
      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: UserRole.ATHLETE,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Błąd rejestracji");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLoginMode ? "Zaloguj się" : "Utwórz konto"}
      size="md"
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLoginMode
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LogIn className="h-4 w-4 inline mr-2" />
            Logowanie
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLoginMode
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Rejestracja
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoginMode ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="login-email"
                className="text-sm font-medium text-gray-700"
              >
                Adres e-mail
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="pl-10"
                  placeholder="twoj@email.com"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="login-password"
                className="text-sm font-medium text-gray-700"
              >
                Hasło
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="pl-10 pr-10"
                  placeholder="Wprowadź hasło"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Logowanie...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Zaloguj się
                </>
              )}
            </Button>

            {/* Test Accounts */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Konta testowe:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setLoginData({
                      email: "admin@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="p-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLoginData({
                      email: "coach@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                >
                  🏃‍♂️ Trener
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLoginData({
                      email: "athlete@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="p-2 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                >
                  🏆 Zawodnik
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLoginData({
                      email: "organizer@athletics.pl",
                      password: "password123",
                    })
                  }
                  className="p-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
                >
                  📋 Organizator
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Kliknij na rolę, aby automatycznie wypełnić dane logowania
              </p>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="register-firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  Imię
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-firstName"
                    type="text"
                    required
                    value={registerData.firstName}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="pl-10"
                    placeholder="Imię"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="register-lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Nazwisko
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-lastName"
                    type="text"
                    required
                    value={registerData.lastName}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="pl-10"
                    placeholder="Nazwisko"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="register-email"
                className="text-sm font-medium text-gray-700"
              >
                Adres e-mail
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="register-email"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="pl-10"
                  placeholder="twoj@email.com"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="register-password"
                className="text-sm font-medium text-gray-700"
              >
                Hasło
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="pl-10"
                  placeholder="Minimum 8 znaków"
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="register-confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Potwierdź hasło
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="register-confirmPassword"
                  type="password"
                  required
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="pl-10"
                  placeholder="Powtórz hasło"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Tworzenie konta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Utwórz konto
                </>
              )}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          {isLoginMode ? (
            <p>
              Nie masz konta?{" "}
              <button
                onClick={() => setIsLoginMode(false)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Zarejestruj się
              </button>
            </p>
          ) : (
            <p>
              Masz już konto?{" "}
              <button
                onClick={() => setIsLoginMode(true)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Zaloguj się
              </button>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
