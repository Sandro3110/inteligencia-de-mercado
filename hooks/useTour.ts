"use client";

import { useState, useEffect, useCallback } from "react";

export type TourType = "dashboard" | "projects" | "alerts" | "settings";

export interface Tour {
  id: TourType;
  name: string;
  steps: TourStep[];
}

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

export const TOURS: Record<TourType, Tour> = {
  dashboard: {
    id: "dashboard",
    name: "Dashboard Tour",
    steps: [
      {
        target: ".dashboard-overview",
        title: "Dashboard Overview",
        content: "This is your main dashboard where you can see all your metrics.",
        placement: "bottom",
      },
    ],
  },
  projects: {
    id: "projects",
    name: "Projects Tour",
    steps: [
      {
        target: ".projects-list",
        title: "Projects List",
        content: "Here you can view and manage all your projects.",
        placement: "bottom",
      },
    ],
  },
  alerts: {
    id: "alerts",
    name: "Alerts Tour",
    steps: [
      {
        target: ".alerts-config",
        title: "Alert Configuration",
        content: "Configure your alerts and notifications here.",
        placement: "bottom",
      },
    ],
  },
  settings: {
    id: "settings",
    name: "Settings Tour",
    steps: [
      {
        target: ".settings-panel",
        title: "Settings",
        content: "Manage your account and application settings.",
        placement: "bottom",
      },
    ],
  },
};

interface TourState {
  isRunning: boolean;
  hasCompleted: boolean;
}

export function useTour(tourId: TourType) {
  const [state, setState] = useState<TourState>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`tour-${tourId}`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return {
            isRunning: data.isRunning || false,
            hasCompleted: data.hasCompleted || false,
          };
        } catch {
          // Ignore parse errors
        }
      }
    }
    return {
      isRunning: false,
      hasCompleted: false,
    };
  });

  const startTour = useCallback(() => {
    const newState = { isRunning: true, hasCompleted: false };
    setState(newState);
    localStorage.setItem(`tour-${tourId}`, JSON.stringify(newState));
  }, [tourId]);

  const completeTour = useCallback(() => {
    const newState = { isRunning: false, hasCompleted: true };
    setState(newState);
    localStorage.setItem(`tour-${tourId}`, JSON.stringify(newState));
  }, [tourId]);

  const resetTour = useCallback(() => {
    const newState = { isRunning: false, hasCompleted: false };
    setState(newState);
    localStorage.setItem(`tour-${tourId}`, JSON.stringify(newState));
  }, [tourId]);

  return {
    isRunning: state.isRunning,
    hasCompleted: state.hasCompleted,
    startTour,
    completeTour,
    resetTour,
  };
}
