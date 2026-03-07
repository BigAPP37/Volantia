import { motion } from "framer-motion";
import { Shield, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Política de Privacidad</h1>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
              <section>
                <h2 className="text-foreground text-lg font-semibold">1. Introducción</h2>
                <p>
                  En Volantia, nos tomamos muy en serio la privacidad de tus datos. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos la información personal de los conductores profesionales que utilizan nuestra aplicación.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-lg font-semibold">2. Información que Recopilamos</h2>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Información de Perfil:</strong> Nombre de usuario, dirección de correo electrónico y foto de perfil (si se proporciona).</li>
                  <li><strong>Datos de Registro Laboral:</strong> Fechas, horas de inicio y fin, descansos, kilómetros, dietas y pernoctas introducidas manualmente por el usuario.</li>
                  <li><strong>Gastos y Tickets:</strong> Información sobre gastos y fotos de tickets/recibos cargados voluntariamente por el usuario para su control interno.</li>
                  <li><strong>Ajustes de Usuario:</strong> Configuración personalizada de tarifas, IRPF y preferencias de visualización.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground text-lg font-semibold">3. Uso de la Información</h2>
                <p>Utilizamos tus datos exclusivamente para:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Proporcionar el servicio de control horario y cálculo de estadísticas financieras.</li>
                  <li>Permitir la exportación de informes en formato PDF.</li>
                  <li>Sincronizar tus datos entre dispositivos a través de tu cuenta personal.</li>
                  <li>Mejorar las funcionalidades de la aplicación basándonos en el uso técnico.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground text-lg font-semibold">4. Almacenamiento y Seguridad</h2>
                <p>
                  Tus datos se almacenan de forma segura utilizando la infraestructura de Lovable Cloud (basada en tecnología de vanguardia con cifrado SSL). Implementamos medidas técnicas para proteger tu información contra acceso no autorizado.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-lg font-semibold">5. Tus Derechos</h2>
                <p>
                  De acuerdo con el RGPD y las leyes de protección de datos aplicables, tienes derecho a:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Acceder a tus datos personales en cualquier momento.</li>
                  <li>Rectificar información inexacta.</li>
                  <li><strong>Suprimir (eliminar) tu cuenta y todos los datos asociados</strong> de forma definitiva desde los ajustes del perfil.</li>
                  <li>Solicitar la portabilidad de tus datos.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-foreground text-lg font-semibold">6. Terceros</h2>
                <p>
                  No vendemos ni compartimos tus datos personales con terceros con fines publicitarios. Los datos solo son procesados por nuestros proveedores de servicios de infraestructura necesarios para el funcionamiento de la app.
                </p>
              </section>

              <section>
                <h2 className="text-foreground text-lg font-semibold">7. Contacto</h2>
                <p>
                  Si tienes dudas sobre esta política, puedes contactarnos a través de los canales oficiales de Volantia.
                </p>
              </section>

              <div className="pt-8 text-xs border-t border-border italic text-center">
                Última actualización: 14 de febrero de 2026
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
