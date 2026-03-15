import { motion } from "framer-motion";
import { FileText, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LAST_UPDATED = "15 de marzo de 2026";
const CONTACT_EMAIL = "legal@volantia.app";
const APP_NAME = "Volantia";

const TermsOfService = () => {
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
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Términos de Servicio</h1>
                <p className="text-xs text-slate-500">Última actualización: {LAST_UPDATED}</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate-400 leading-relaxed">

              <section>
                <h2 className="text-white font-semibold text-base mb-2">1. Aceptación de los Términos</h2>
                <p>Al descargar, instalar o utilizar {APP_NAME}, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo, no uses la aplicación.</p>
                <p className="mt-2">Debes tener al menos <strong className="text-slate-300">18 años</strong> para usar {APP_NAME}.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">2. Descripción del Servicio</h2>
                <p>{APP_NAME} es una aplicación de control horario y gestión de nómina destinada a <strong className="text-slate-300">conductores profesionales de transporte en España</strong>. Permite registrar jornadas, calcular dietas, exportar informes y estimar ingresos netos.</p>
                <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <p className="text-amber-400 font-medium text-xs">⚠️ Aviso importante</p>
                  <p className="text-xs mt-1">{APP_NAME} es una herramienta de apoyo. Los cálculos de nómina son <strong>estimaciones orientativas</strong>. Para información fiscal o laboral oficial, consulta a un asesor o gestoría.</p>
                </div>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">3. Cuenta de Usuario</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
                  <li>Debes proporcionar información veraz en el registro</li>
                  <li>Una cuenta por persona física</li>
                  <li>No puedes transferir tu cuenta a terceros</li>
                  <li>Notifica inmediatamente cualquier acceso no autorizado a <span className="text-blue-400">{CONTACT_EMAIL}</span></li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">4. Uso Aceptable</h2>
                <p className="mb-2">Puedes usar {APP_NAME} para:</p>
                <ul className="list-disc pl-5 space-y-1 mb-3">
                  <li>Registrar tus jornadas laborales personales</li>
                  <li>Consultar estimaciones de tu nómina</li>
                  <li>Exportar tus datos para uso personal o laboral</li>
                </ul>
                <p className="mb-2 text-slate-300">Queda prohibido:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Usar la app para registrar jornadas de terceros sin su consentimiento</li>
                  <li>Intentar acceder a datos de otros usuarios</li>
                  <li>Realizar ingeniería inversa o modificar la aplicación</li>
                  <li>Usar la app para actividades ilegales</li>
                  <li>Sobrecargar intencionadamente los servidores</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">5. Propiedad Intelectual</h2>
                <p>{APP_NAME} y todos sus contenidos (diseño, código, marca, textos) son propiedad de {APP_NAME} o sus licenciantes. Se te concede una <strong className="text-slate-300">licencia limitada, personal, no exclusiva y no transferible</strong> para usar la aplicación conforme a estos términos.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">6. Planes y Pagos</h2>
                <p>{APP_NAME} ofrece un plan gratuito con funcionalidades básicas. Las funcionalidades premium (si existieran en el futuro) se detallarán en la aplicación antes de cualquier cargo.</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Los pagos se gestionan a través de App Store (Apple) o Google Play</li>
                  <li>Las suscripciones se renuevan automáticamente salvo cancelación</li>
                  <li>Reembolsos sujetos a la política de Apple/Google</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">7. Limitación de Responsabilidad</h2>
                <p className="mb-2">{APP_NAME} no será responsable de:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Errores en los cálculos derivados de datos incorrectos introducidos por el usuario</li>
                  <li>Decisiones laborales, fiscales o económicas basadas en las estimaciones de la app</li>
                  <li>Pérdida de datos por causas ajenas a nuestra infraestructura (pérdida del dispositivo, etc.)</li>
                  <li>Interrupciones del servicio por mantenimiento o causas técnicas</li>
                </ul>
                <p className="mt-2">La responsabilidad máxima de {APP_NAME} no superará el importe pagado por el usuario en los últimos 12 meses.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">8. Modificaciones del Servicio</h2>
                <p>Nos reservamos el derecho de modificar, suspender o interrumpir el servicio en cualquier momento, notificando con al menos <strong className="text-slate-300">30 días de antelación</strong> salvo causas de fuerza mayor.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">9. Resolución y Cancelación</h2>
                <p>Puedes cancelar tu cuenta en cualquier momento desde <strong className="text-slate-300">Ajustes → Perfil → Eliminar cuenta</strong>.</p>
                <p className="mt-2">Podemos suspender o cancelar cuentas que incumplan estos términos, con notificación previa salvo casos graves.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">10. Ley Aplicable y Jurisdicción</h2>
                <p>Estos términos se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de España, sin perjuicio de los derechos del consumidor reconocidos por la legislación europea.</p>
              </section>

              <section>
                <h2 className="text-white font-semibold text-base mb-2">11. Contacto</h2>
                <div className="rounded-xl p-4" style={{ background: "rgba(13,22,45,0.5)", border: "1px solid rgba(59,130,246,0.1)" }}>
                  <p><strong className="text-slate-300">Email legal:</strong> <span className="text-blue-400">{CONTACT_EMAIL}</span></p>
                </div>
              </section>

              <div className="pt-4 text-xs border-t border-white/10 text-slate-600 text-center">
                {APP_NAME} · Términos de Servicio · {LAST_UPDATED}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
