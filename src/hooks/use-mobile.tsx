import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    return false;
  });

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Usar matchMedia para detecção mais confiável
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Função para atualizar baseado no matchMedia
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Verificar inicialmente
    setIsMobile(mql.matches);

    // Adicionar listener do matchMedia (mais confiável para DevTools)
    if (mql.addEventListener) {
      mql.addEventListener("change", handleMediaChange);
    } else {
      // Fallback para navegadores antigos
      mql.addListener(handleMediaChange);
    }

    // Também adicionar listener de resize como fallback
    window.addEventListener("resize", checkIsMobile);

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handleMediaChange);
      } else {
        mql.removeListener(handleMediaChange);
      }
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return isMobile;
}
