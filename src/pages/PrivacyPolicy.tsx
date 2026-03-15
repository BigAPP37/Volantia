import { motion } from "framer-motion";
import { Shield, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LAST_UPDATED = "15 de marzo de 2026";
const CONTACT_EMAIL = "privacidad@volantia.app";
const COMPANY_NAME = "Volantia";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-4 pb-20" style={{ background: "#070f1e" }}>
      <div className="max-w-2xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2 text-slate-400">
          <ChevronLeft className="w-4 h-4 mr-2" />Volver
        </Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl p-6 space-y-6" style={{ background: "rgba(13,22,45,0.72)", border: "1px solid rgba(59,130,246,0.1)" }}>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.12)" }}>
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Política de Privacidad</h1>
                <p className="text-xs text-slate-500">Última actualización: {LAST_UPDATED}</p>
              </div>
            </div>
            <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
              <section>
                <h2 className="text-white font-semibold text-base mb-2">1. Responsable del Tratamiento</h2>
                <p>{COMPANY_NAME} es el responsable del tratamiento de tus datos conforme al RGPD (UE) 2016/679 y la LOPDGDD 3/2018.</p>
                <p className="mt-2">Contacto: <span className="text-blue-400">{CONTACT_EMAIL}</span></p>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">2. Datos que Recopilamos</h2>
                <p className="text-slate-300 font-medium mb-1">Datos que tú proporcionas:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email y nombre de usuario</li>
                  <li>Datos laborales: horarios, horas, kilómetros, dietas, pernoctas</li>
                  <li>Configuración de nómina: salario, IRPF, SS, tarifas</li>
                  <li>Fotos de tickets (si usas el escaneo)</li>
                </ul>
                <p className="text-slate-300 font-medium mt-3 mb-1">Lo que NO recopilamos:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ubicación GPS ni localización en tiempo real</li>
                  <li>Contactos del dispositivo</li>
                  <li>Datos biométricos ni de pago</li>
                </ul>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">3. Finalidad y Base Legal</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Prestación del servicio — <span className="text-blue-400">Art. 6.1.b RGPD</span></li>
                  <li>Sincronización y exportación PDF — <span className="text-blue-400">Art. 6.1.b RGPD</span></li>
                  <li>Seguridad y mejora técnica — <span className="text-blue-400">Art. 6.1.f RGPD</span></li>
                  <li>Comunicaciones opcionales — <span className="text-blue-400">Art. 6.1.a RGPD</span></li>
                </ul>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">4. Proveedores de Servicios</h2>
                {[
                  { name: "Supabase Inc.", role: "Base de datos y autenticación", loc: "EE.UU. (SCCs EU-US)" },
                  { name: "Vercel Inc.", role: "Alojamiento web y CDN", loc: "EE.UU. (SCCs EU-US)" },
                  { name: "Google LLC (Gemini API)", role: "OCR de tickets", loc: "EE.UU. (SCCs EU-US)" },
                ].map((p, i) => (
                  <div key={i} className="rounded-xl p-3 mb-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-slate-300 font-medium">{p.name}</p>
                    <p className="text-xs mt-0.5">{p.role} · {p.loc}</p>
                  </div>
                ))}
                <p className="text-xs text-slate-500 mt-2">No vendemos ni cedemos datos a terceros con fines publicitarios.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">5. Conservación</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Datos activos: mientras mantengas tu cuenta</li>
                  <li>Tras eliminación de cuenta: supresión en máximo 30 días</li>
                  <li>Copias de seguridad: 30 días adicionales</li>
                </ul>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">6. Tus Derechos (RGPD)</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Acceso", "Obtener copia de tus datos"],
                    ["Rectificación", "Corregir datos inexactos"],
                    ["Supresión", "Eliminar cuenta y datos"],
                    ["Portabilidad", "Exportar en JSON/CSV"],
                    ["Limitación", "Restringir el tratamiento"],
                    ["Oposición", "Oponerte al tratamiento"],
                  ].map(([r, d], i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
                      <p className="text-blue-400 font-medium text-xs">{r}</p>
                      <p className="text-xs mt-0.5">{d}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3">Ejerce tus derechos en <span className="text-blue-400">{CONTACT_EMAIL}</span> (plazo: 30 días). Puedes reclamar ante la <a href="https://www.aepd.es" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">AEPD</a>.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">7. Eliminación de Cuenta</h2>
                <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p className="text-slate-300 font-medium">Ajustes → Perfil → Eliminar cuenta</p>
                  <p className="text-xs mt-1 text-slate-500">Permanente e irreversible. Datos borrados en máximo 30 días.</p>
                </div>
                <p className="mt-2">O por email: <span className="text-blue-400">{CONTACT_EMAIL}</span></p>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">8. Seguridad</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Cifrado TLS 1.3 en todas las comunicaciones</li>
                  <li>Contraseñas con hash bcrypt (nunca en texto plano)</li>
                  <li>Row Level Security (RLS) en base de datos</li>
                  <li>Tokens JWT de corta duración</li>
                </ul>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">9. Menores de Edad</h2>
                <p>Volantia está destinada a conductores profesionales mayores de 18 años. No recopilamos datos de menores conscientemente.</p>
              </section>
              <section>
                <h2 className="text-white font-semibold text-base mb-2">10. Cambios en esta Política</h2>
                <p>Los cambios significativos se notificarán con 30 días de antelación por notificación en app y/o email.</p>
              </section>
              <div className="pt-4 text-xs border-t border-white/10 text-slate-600 text-center">
                {COMPANY_NAME} · Política de Privacidad · {LAST_UPDATED}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
