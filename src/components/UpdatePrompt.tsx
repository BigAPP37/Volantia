import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

export function UpdatePrompt() {
  const [visible, setVisible] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Comprueba si hay actualización cada 60 segundos
      if (r) {
        setInterval(() => r.update(), 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (needRefresh) setVisible(true);
  }, [needRefresh]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[300] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-2xl max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
        <RefreshCw className="w-5 h-5 shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Nueva versión disponible</p>
          <p className="text-xs text-blue-200 leading-tight">Actualiza para obtener las últimas mejoras</p>
        </div>
        <button
          onClick={() => updateServiceWorker(true)}
          className="shrink-0 bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Actualizar
        </button>
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 text-blue-200 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
