"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingContextType {
  isOnboardingComplete: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Welcome to the application",
    completed: false,
  },
  {
    id: "setup",
    title: "Setup",
    description: "Set up your account",
    completed: false,
  },
  {
    id: "tour",
    title: "Tour",
    description: "Take a tour of the features",
    completed: false,
  },
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(DEFAULT_STEPS);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("onboarding");
    if (stored) {
      const data = JSON.parse(stored);
      setIsOnboardingComplete(data.isComplete || false);
      setCurrentStep(data.currentStep || 0);
      setSteps(data.steps || DEFAULT_STEPS);
    }
  }, []);

  const saveToStorage = (data: {
    isComplete: boolean;
    currentStep: number;
    steps: OnboardingStep[];
  }) => {
    localStorage.setItem("onboarding", JSON.stringify(data));
  };

  const completeStep = (stepId: string) => {
    const newSteps = steps.map((step) =>
      step.id === stepId ? { ...step, completed: true } : step
    );
    setSteps(newSteps);

    const allCompleted = newSteps.every((step) => step.completed);
    if (allCompleted) {
      setIsOnboardingComplete(true);
    }

    saveToStorage({
      isComplete: allCompleted,
      currentStep,
      steps: newSteps,
    });
  };

  const skipOnboarding = () => {
    setIsOnboardingComplete(true);
    saveToStorage({
      isComplete: true,
      currentStep,
      steps,
    });
  };

  const resetOnboarding = () => {
    setIsOnboardingComplete(false);
    setCurrentStep(0);
    setSteps(DEFAULT_STEPS);
    saveToStorage({
      isComplete: false,
      currentStep: 0,
      steps: DEFAULT_STEPS,
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveToStorage({
        isComplete: isOnboardingComplete,
        currentStep: newStep,
        steps,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      saveToStorage({
        isComplete: isOnboardingComplete,
        currentStep: newStep,
        steps,
      });
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingComplete,
        currentStep,
        steps,
        completeStep,
        skipOnboarding,
        resetOnboarding,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
