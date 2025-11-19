import React, { createContext, useContext, useState, useEffect } from "react";

interface OnboardingContextType {
  isOnboarding: boolean;
  startOnboarding: () => void;
  stopOnboarding: () => void;
  hasCompletedOnboarding: boolean;
  markOnboardingComplete: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_KEY = "gestor-pav-onboarding-completed";

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  });

  const startOnboarding = () => {
    setIsOnboarding(true);
  };

  const stopOnboarding = () => {
    setIsOnboarding(false);
  };

  const markOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setHasCompletedOnboarding(true);
    setIsOnboarding(false);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        startOnboarding,
        stopOnboarding,
        hasCompletedOnboarding,
        markOnboardingComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
