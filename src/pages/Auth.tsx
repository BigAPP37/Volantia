import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowLeft, ArrowRight,
  Calendar, FileText, Camera, BarChart3, Wallet, Settings,
  Clock, Moon, Utensils, Plus, Receipt, Fuel, ParkingCircle,
  Percent, Sliders, TrendingUp, ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// ── Animated Background ──────────────────────────────────────────
function RoadBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Dark gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />

      {/* Road lines - horizontal flowing */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="roadLines" x="0" y="0" width="120" height="40" patternUnits="userSpaceOnUse">
            <rect x="10" y="18" width="40" height="4" rx="2" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#roadLines)">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -120 0"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>

      {/* Speed lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`speed-${i}`}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
          style={{
            top: `${10 + i * 12}%`,
            width: `${100 + Math.random() * 200}px`,
          }}
          animate={{
            x: ['-200px', '110vw'],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating euro signs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`euro-${i}`}
          className="absolute text-emerald-400/[0.06] font-bold select-none"
          style={{
            fontSize: `${30 + i * 15}px`,
            left: `${10 + i * 18}%`,
            top: `${15 + (i % 3) * 30}%`,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            delay: i * 1.2,
            ease: 'easeInOut',
          }}
        >
          €
        </motion.div>
      ))}

      {/* KM counter dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`km-${i}`}
          className="absolute text-blue-300/[0.05] font-mono text-xs select-none"
          style={{
            right: `${5 + i * 10}%`,
            bottom: `${10 + (i % 4) * 15}%`,
          }}
          animate={{
            opacity: [0.03, 0.07, 0.03],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          {(Math.floor(Math.random() * 999) + 100).toLocaleString()} km
        </motion.div>
      ))}

      {/* Speedometer arc - bottom right */}
      <svg className="absolute bottom-0 right-0 w-80 h-80 opacity-[0.04]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="3" fill="none" strokeDasharray="8 12" />
        <circle cx="100" cy="100" r="60" stroke="white" strokeWidth="2" fill="none" strokeDasharray="4 8" />
        <motion.line
          x1="100" y1="100" x2="100" y2="30"
          stroke="white" strokeWidth="2" strokeLinecap="round"
          animate={{ rotate: ['-60deg', '60deg', '-60deg'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 100px' }}
        />
      </svg>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

// ── Onboarding Slides ────────────────────────────────────────────
const onboardingSlides = [
  {
    icon: Calendar,
    title: 'Registro de Jornadas',
    description: 'Registra tu entrada y salida con un toque. Horas nocturnas, extras, descansos... todo en un solo lugar.',
    color: 'from-emerald-500 to-emerald-600',
    accentColor: 'text-emerald-400',
    bgAccent: 'bg-emerald-500/20',
    features: [
      { icon: Clock, text: 'Hora entrada / salida' },
      { icon: Moon, text: 'Horas nocturnas' },
      { icon: Plus, text: 'Horas extras' },
    ],
  },
  {
    icon: Utensils,
    title: 'Dietas y Pernoctas',
    description: 'Controla tus dietas nacionales e internacionales, medias dietas, y pernoctas. Todo se calcula automáticamente.',
    color: 'from-amber-500 to-amber-600',
    accentColor: 'text-amber-400',
    bgAccent: 'bg-amber-500/20',
    features: [
      { icon: Utensils, text: 'Dietas completas' },
      { icon: Moon, text: 'Pernoctas' },
      { icon: TrendingUp, text: 'Nacional / Internacional' },
    ],
  },
  {
    icon: FileText,
    title: 'Plantillas de Ruta',
    description: 'Guarda tus rutas habituales y aplícalas con un clic. Madrid-Barcelona, Ruta Norte... ahorra tiempo cada día.',
    color: 'from-violet-500 to-violet-600',
    accentColor: 'text-violet-400',
    bgAccent: 'bg-violet-500/20',
    features: [
      { icon: FileText, text: 'Rutas guardadas' },
      { icon: Clock, text: 'Horarios predefinidos' },
      { icon: Plus, text: 'Crea las tuyas' },
    ],
  },
  {
    icon: Camera,
    title: 'Escaneo de Tickets',
    description: 'Fotografía tus recibos de gasoil, peajes y parking. La IA extrae los datos automáticamente.',
    color: 'from-rose-500 to-rose-600',
    accentColor: 'text-rose-400',
    bgAccent: 'bg-rose-500/20',
    features: [
      { icon: Fuel, text: 'Gasoil' },
      { icon: ParkingCircle, text: 'Parking' },
      { icon: Receipt, text: 'Peajes' },
    ],
  },
  {
    icon: BarChart3,
    title: 'Estadísticas y Nómina',
    description: 'Visualiza horas trabajadas, ingresos estimados, y calcula tu nómina con todos los conceptos y deducciones.',
    color: 'from-cyan-500 to-cyan-600',
    accentColor: 'text-cyan-400',
    bgAccent: 'bg-cyan-500/20',
    features: [
      { icon: BarChart3, text: 'Gráficos mensuales' },
      { icon: Wallet, text: 'Nómina estimada' },
      { icon: Percent, text: 'IRPF y SS' },
    ],
  },
  {
    icon: Settings,
    title: 'Personalización Total',
    description: 'Configura tu salario base, tarifas, conceptos personalizados y adapta la app a tu convenio colectivo.',
    color: 'from-slate-400 to-slate-500',
    accentColor: 'text-slate-300',
    bgAccent: 'bg-slate-500/20',
    features: [
      { icon: Sliders, text: 'Tarifas personalizadas' },
      { icon: Wallet, text: 'Salario base' },
      { icon: Settings, text: 'Tu convenio' },
    ],
  },
];

function FeatureCard({ slide, isActive }: { slide: typeof onboardingSlides[0]; isActive: boolean }) {
  const Icon = slide.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.9, y: isActive ? 0 : 20 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="flex flex-col items-center text-center"
    >
      {/* Icon with glow */}
      <div className="relative mb-4">
        <motion.div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${slide.color} blur-2xl opacity-40`}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{slide.title}</h3>
      <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-5">{slide.description}</p>

      {/* Feature pills */}
      <div className="flex gap-2 flex-wrap justify-center">
        {slide.features.map((feat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${slide.bgAccent} backdrop-blur-sm`}
          >
            <feat.icon className={`w-3.5 h-3.5 ${slide.accentColor}`} />
            <span className={`text-xs font-medium ${slide.accentColor}`}>{feat.text}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Auth Component ──────────────────────────────────────────
export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // If user already has a session, redirect to home
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Check if onboarding was already seen
  const hasSeenOnboarding = () => {
    try { return localStorage.getItem('volantia_onboarding_seen') === 'true'; } catch { return false; }
  };

  const markOnboardingSeen = () => {
    try { localStorage.setItem('volantia_onboarding_seen', 'true'); } catch { /* ignore */ }
  };

  const [phase, setPhase] = useState<'onboarding' | 'auth'>(hasSeenOnboarding() ? 'auth' : 'onboarding');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLogin, setIsLogin] = useState(hasSeenOnboarding());
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  // Mark onboarding as seen when user moves to auth phase
  useEffect(() => {
    if (phase === 'auth') markOnboardingSeen();
  }, [phase]);

  // Auto-advance slides
  useEffect(() => {
    if (phase !== 'onboarding') return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % onboardingSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [phase, currentSlide]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const schema = isLogin ? loginSchema : signupSchema;
      const result = schema.safeParse(formData);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: '❌ Error de acceso',
            description: error.message.includes('Invalid login credentials')
              ? 'Email o contraseña incorrectos'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: '✅ ¡Bienvenido!', description: 'Has iniciado sesión correctamente' });
          navigate('/');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.displayName);
        if (error) {
          toast({
            title: '❌ Error',
            description: error.message.includes('already registered')
              ? 'Este email ya está registrado'
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: '✅ ¡Cuenta creada!', description: 'Ya puedes empezar a usar Volantia' });
          navigate('/');
        }
      }
    } catch {
      toast({ title: '❌ Error', description: 'Ha ocurrido un error inesperado', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <RoadBackground />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Logo header */}
        <motion.div
          className="flex items-center justify-center pt-8 pb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg viewBox="0 0 512 512" className="w-6 h-6" fill="none">
                <circle cx="256" cy="240" r="150" stroke="white" strokeWidth="28" />
                <circle cx="256" cy="240" r="52" stroke="white" strokeWidth="22" />
                <line x1="256" y1="188" x2="256" y2="90" stroke="white" strokeWidth="22" strokeLinecap="round" />
                <line x1="211" y1="266" x2="130" y2="314" stroke="white" strokeWidth="22" strokeLinecap="round" />
                <line x1="301" y1="266" x2="382" y2="314" stroke="white" strokeWidth="22" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Volantia</h1>
              <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Control Horario</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'onboarding' ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col"
            >
              {/* Slides */}
              <div className="flex-1 flex items-center justify-center px-6 py-4">
                <AnimatePresence mode="wait">
                  <motion.div key={currentSlide}>
                    <FeatureCard
                      slide={onboardingSlides[currentSlide]}
                      isActive={true}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 py-3">
                {onboardingSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="relative h-2 rounded-full overflow-hidden transition-all"
                    style={{ width: index === currentSlide ? 32 : 8 }}
                  >
                    <div className={cn(
                      'absolute inset-0 rounded-full transition-colors',
                      index === currentSlide ? 'bg-blue-500' : 'bg-white/20'
                    )} />
                    {index === currentSlide && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-blue-400"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 5, ease: 'linear' }}
                        style={{ transformOrigin: 'left' }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Navigation arrows */}
              <div className="flex justify-between items-center px-6 py-2">
                <button
                  onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                  className={cn(
                    'p-2 rounded-full transition-opacity',
                    currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-50 hover:opacity-100'
                  )}
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => Math.min(onboardingSlides.length - 1, prev + 1))}
                  className={cn(
                    'p-2 rounded-full transition-opacity',
                    currentSlide === onboardingSlides.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-50 hover:opacity-100'
                  )}
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* CTA Buttons */}
              <div className="px-6 pb-6 space-y-3">
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => { setPhase('auth'); setIsLogin(false); }}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-base shadow-xl shadow-blue-500/30 border-0"
                  >
                    Crear Cuenta Gratis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => { setPhase('auth'); setIsLogin(true); }}
                    className="flex-1 py-5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                  >
                    Iniciar Sesión
                  </Button>
                  <Link to="/" className="flex-1">
                    <Button
                      variant="ghost"
                      className="w-full py-5 rounded-2xl text-white/50 hover:text-white/70 hover:bg-white/5 border border-white/5"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Invitado
                    </Button>
                  </Link>
                </div>

                <p className="text-center text-[11px] text-white/30">
                  El modo invitado guarda datos solo en este dispositivo
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center px-6 py-6"
            >
              {/* Back button */}
              <button
                onClick={() => setPhase('onboarding')}
                className="flex items-center gap-1 text-white/50 hover:text-white/80 mb-6 transition-colors self-start"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Volver</span>
              </button>

              {/* Form card */}
              <div className="w-full max-w-sm mx-auto">
                <div className="bg-white/[0.05] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                  <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-white">
                      {isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-sm text-white/50 mt-1">
                      {isLogin ? 'Accede a tu cuenta' : 'Regístrate para sincronizar tus datos'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <Label htmlFor="displayName" className="flex items-center gap-2 text-white/70 text-sm">
                          <User className="h-3.5 w-3.5" />
                          Nombre
                        </Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => handleChange('displayName', e.target.value)}
                          placeholder="Tu nombre"
                          className={cn(
                            'mt-1.5 rounded-xl bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20',
                            errors.displayName && 'border-red-500/50'
                          )}
                        />
                        {errors.displayName && <p className="mt-1 text-xs text-red-400">{errors.displayName}</p>}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2 text-white/70 text-sm">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        className={cn(
                          'mt-1.5 rounded-xl bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20',
                          errors.email && 'border-red-500/50'
                        )}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="password" className="flex items-center gap-2 text-white/70 text-sm">
                        <Lock className="h-3.5 w-3.5" />
                        Contraseña
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleChange('password', e.target.value)}
                          placeholder="••••••••"
                          className={cn(
                            'rounded-xl bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 pr-10 focus:border-blue-500/50 focus:ring-blue-500/20',
                            errors.password && 'border-red-500/50'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                    </div>

                    {!isLogin && (
                      <div>
                        <Label htmlFor="confirmPassword" className="text-white/70 text-sm">Confirmar Contraseña</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleChange('confirmPassword', e.target.value)}
                          placeholder="••••••••"
                          className={cn(
                            'mt-1.5 rounded-xl bg-white/[0.07] border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20',
                            errors.confirmPassword && 'border-red-500/50'
                          )}
                        />
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/25 border-0 mt-2"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {isLogin ? 'Iniciando...' : 'Creando cuenta...'}
                        </span>
                      ) : (
                        isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                      )}
                    </Button>
                  </form>

                  <div className="mt-5 text-center">
                    <p className="text-sm text-white/40">
                      {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setErrors({});
                        }}
                        className="ml-1 font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {isLogin ? 'Regístrate' : 'Inicia sesión'}
                      </button>
                    </p>
                  </div>
                </div>

                {/* Guest mode */}
                <Link to="/" className="block mt-4">
                  <Button variant="ghost" className="w-full rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continuar como invitado
                  </Button>
                </Link>

                <div className="mt-4 text-center">
                  <Link
                    to="/privacy"
                    className="text-xs text-white/20 hover:text-white/40 transition-colors underline"
                  >
                    Política de Privacidad
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
