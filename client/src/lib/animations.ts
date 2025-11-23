import { Variants } from "framer-motion";

/**
 * Variantes de animação reutilizáveis para Framer Motion
 * Seguindo princípios de design moderno com timing suave
 */

// Transições de página
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

export const pageTransition = {
  duration: 0.3,
  ease: "easeInOut" as const,
};

// Stagger animations para listas
export const listVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms entre cada item
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
};

// Fade in/out simples
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// Scale + fade (para modals, tooltips)
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

// Slide from bottom (para sheets, drawers)
export const slideUpVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Configuração para respeitar prefers-reduced-motion
export const getReducedMotionConfig = () => {
  if (typeof window === "undefined") return false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  return prefersReducedMotion;
};

// Wrapper para desabilitar animações se usuário preferir
export const withReducedMotion = (variants: Variants): Variants => {
  if (getReducedMotionConfig()) {
    // Retornar variantes sem animação
    return {
      initial: {},
      animate: {},
      exit: {},
      hidden: {},
      visible: {},
      show: {},
    };
  }

  return variants;
};
