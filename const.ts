export const APP_TITLE = "IntelMarket";
export const APP_LOGO = "/logo.svg";
export const APP_DESCRIPTION = "Inteligência de Mercado";

export function getLoginUrl(): string {
  return "/login";
}

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  ALERTS: "/alerts",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const API_ENDPOINTS = {
  AUTH: "/api/auth",
  PROJECTS: "/api/projects",
  ALERTS: "/api/alerts",
  NOTIFICATIONS: "/api/notifications",
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  SELECTED_PROJECT: "selected_project",
  THEME: "theme",
  COMPACT_MODE: "compact_mode",
} as const;
