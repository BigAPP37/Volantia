import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  FileText, 
  Camera, 
  BarChart3, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wallet,
  Plus,
  Clock,
  Moon,
  Utensils,
  TrendingUp,
  Receipt,
  Fuel,
  ParkingCircle,
  Percent,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface OnboardingScreenProps {
  onComplete: () => void;
}

// Icon animation variants
const iconAnimations = {
  sparkles: {
    animate: {
      rotate: [0, 15, -15, 0],
      scale: [1, 1.2, 1],
    },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
  },
  calendar: {
    animate: {
      y: [0, -5, 0],
    },
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
  },
  fileText: {
    animate: {
      rotateY: [0, 180, 360],
    },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
  },
  camera: {
    animate: {
      scale: [1, 1.1, 1],
    },
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
  },
  chart: {
    animate: {
      scaleY: [1, 1.2, 1],
    },
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" as const }
  },
  wallet: {
    animate: {
      rotateZ: [0, -10, 10, 0],
    },
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
  },
  settings: {
    animate: {
      rotate: 360,
    },
    transition: { duration: 4, repeat: Infinity, ease: "linear" as const }
  }
};

const slides = [
  {
    icon: Sparkles,
    iconAnimation: iconAnimations.sparkles,
    title: "Bienvenido a Volantia",
    description: "Tu asistente personal para el control horario y financiero. Diseñado especialmente para conductores profesionales.",
    color: "from-brand-500 to-brand-600",
    mockup: "welcome"
  },
  {
    icon: Calendar,
    iconAnimation: iconAnimations.calendar,
    title: "Registro de Jornadas",
    description: "Registra tus horas de trabajo con un solo toque. Añade dietas, pernoctas, horas nocturnas y extras fácilmente.",
    color: "from-emerald-500 to-emerald-600",
    mockup: "entry"
  },
  {
    icon: FileText,
    iconAnimation: iconAnimations.fileText,
    title: "Plantillas de Ruta",
    description: "Guarda tus rutas habituales como plantillas y aplícalas con un clic para ahorrar tiempo cada día.",
    color: "from-violet-500 to-violet-600",
    mockup: "templates"
  },
  {
    icon: Camera,
    iconAnimation: iconAnimations.camera,
    title: "Escaneo de Tickets",
    description: "Fotografía tus recibos y la IA extraerá automáticamente los datos. Gasoil, peajes, parking... todo organizado.",
    color: "from-amber-500 to-amber-600",
    mockup: "scanner"
  },
  {
    icon: BarChart3,
    iconAnimation: iconAnimations.chart,
    title: "Estadísticas Detalladas",
    description: "Visualiza tus horas trabajadas, ingresos estimados y tendencias mensuales con gráficos interactivos.",
    color: "from-cyan-500 to-cyan-600",
    mockup: "stats"
  },
  {
    icon: Wallet,
    iconAnimation: iconAnimations.wallet,
    title: "Control Financiero",
    description: "Calcula tu nómina estimada con todos los conceptos: salario base, dietas, extras y deducciones.",
    color: "from-rose-500 to-rose-600",
    mockup: "payroll"
  },
  {
    icon: Settings,
    iconAnimation: iconAnimations.settings,
    title: "Personalización Total",
    description: "Configura tus tarifas, conceptos personalizados y preferencias para adaptarlo a tu convenio.",
    color: "from-slate-500 to-slate-600",
    mockup: "settings"
  }
];

// Mini mockup components for each feature
const MockupWelcome = () => (
  <div className="w-full h-32 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-3 backdrop-blur border border-white/10 overflow-hidden">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
        <Calendar className="w-4 h-4 text-brand-400" />
      </div>
      <div className="flex-1">
        <div className="h-2 w-16 bg-foreground/20 rounded" />
        <div className="h-1.5 w-24 bg-foreground/10 rounded mt-1" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className={`aspect-square rounded-md ${i % 3 === 0 ? 'bg-brand-500/40' : 'bg-foreground/10'}`}
        />
      ))}
    </div>
  </div>
);

const MockupEntry = () => (
  <div className="w-full h-32 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-3 backdrop-blur border border-white/10 overflow-hidden">
    <div className="flex justify-between items-center mb-2">
      <motion.div 
        className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Clock className="w-3 h-3 text-emerald-400" />
        <span className="text-[10px] text-emerald-400 font-medium">06:00</span>
      </motion.div>
      <motion.div 
        className="flex items-center gap-1 px-2 py-1 bg-rose-500/20 rounded-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <Clock className="w-3 h-3 text-rose-400" />
        <span className="text-[10px] text-rose-400 font-medium">14:00</span>
      </motion.div>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[
        { icon: Moon, label: "Noct.", color: "text-indigo-400", bg: "bg-indigo-500/20" },
        { icon: Utensils, label: "Dietas", color: "text-amber-400", bg: "bg-amber-500/20" },
        { icon: Plus, label: "Extras", color: "text-cyan-400", bg: "bg-cyan-500/20" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={`${item.bg} rounded-lg p-2 flex flex-col items-center`}
        >
          <item.icon className={`w-4 h-4 ${item.color}`} />
          <span className={`text-[8px] ${item.color} mt-1`}>{item.label}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const MockupTemplates = () => (
  <div className="w-full h-32 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-3 backdrop-blur border border-white/10 overflow-hidden">
    {[
      { name: "Madrid - Barcelona", time: "06:00 - 18:00" },
      { name: "Ruta Norte", time: "05:30 - 14:00" },
      { name: "Servicio Express", time: "08:00 - 16:00" },
    ].map((template, i) => (
      <motion.div
        key={i}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 + i * 0.15 }}
        className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0"
      >
        <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <FileText className="w-3 h-3 text-violet-400" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-foreground/80 font-medium">{template.name}</div>
          <div className="text-[8px] text-muted-foreground">{template.time}</div>
        </div>
        <motion.div 
          className="w-5 h-5 rounded-full bg-violet-500/30 flex items-center justify-center"
          whileHover={{ scale: 1.2 }}
        >
          <Plus className="w-3 h-3 text-violet-400" />
        </motion.div>
      </motion.div>
    ))}
  </div>
);

const MockupScanner = () => (
  <div className="w-full h-32 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-3 backdrop-blur border border-white/10 overflow-hidden relative">
    <motion.div
      className="absolute inset-3 border-2 border-dashed border-amber-400/50 rounded-xl"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    <motion.div
      className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
      animate={{ top: ["15%", "85%", "15%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-4">
      {[
        { icon: Fuel, label: "Gasoil" },
        { icon: ParkingCircle, label: "Parking" },
        { icon: Receipt, label: "Peaje" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
            <item.icon className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-[8px] text-amber-400/70 mt-0.5">{item.label}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const MockupStats = () => (
  <div className="w-full h-32 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-3 backdrop-blur border border-white/10 overflow-hidden">
    <div className="flex items-end justify-between h-full gap-1 pb-4">
      {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
    <motion.div 
      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-lg"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
    >
      <TrendingUp className="w-3 h-3 text-cyan-400" />
      <span className="text-[10px] text-cyan-400 font-medium">+12%</span>
    </motion.div>
  </div>
);

const MockupPayroll = () => (
  <div className="w-full h-32 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-3 backdrop-blur border border-white/10 overflow-hidden">
    <motion.div
      className="text-center mb-2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <span className="text-xl font-bold text-rose-400">2.450€</span>
      <div className="text-[8px] text-muted-foreground">Nómina estimada</div>
    </motion.div>
    <div className="space-y-1">
      {[
        { label: "Salario base", value: "1.800€", color: "text-foreground/70" },
        { label: "Dietas", value: "+320€", color: "text-emerald-400" },
        { label: "Horas extra", value: "+450€", color: "text-emerald-400" },
        { label: "IRPF", value: "-120€", color: "text-rose-400" },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="flex justify-between text-[9px]"
        >
          <span className="text-muted-foreground">{item.label}</span>
          <span className={item.color}>{item.value}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const MockupSettings = () => (
  <div className="w-full h-32 bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-3 backdrop-blur border border-white/10 overflow-hidden">
    {[
      { icon: Percent, label: "IRPF", value: "15%" },
      { icon: Utensils, label: "Dieta completa", value: "45€" },
      { icon: Sliders, label: "Hora extra", value: "12€" },
    ].map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 + i * 0.15 }}
        className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0"
      >
        <div className="w-6 h-6 rounded-lg bg-slate-500/20 flex items-center justify-center">
          <item.icon className="w-3 h-3 text-slate-400" />
        </div>
        <span className="flex-1 text-[10px] text-foreground/70">{item.label}</span>
        <motion.div
          className="px-2 py-0.5 bg-slate-500/20 rounded text-[10px] text-slate-300"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        >
          {item.value}
        </motion.div>
      </motion.div>
    ))}
  </div>
);

const mockupComponents: Record<string, React.FC> = {
  welcome: MockupWelcome,
  entry: MockupEntry,
  templates: MockupTemplates,
  scanner: MockupScanner,
  stats: MockupStats,
  payroll: MockupPayroll,
  settings: MockupSettings,
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  const nextSlide = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (!isFirstSlide) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;
  const MockupComponent = mockupComponents[slide.mockup];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 12 }
    }
  };

  const iconContainerVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 200, 
        damping: 15,
        delay: 0.1
      }
    }
  };

  const mockupVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring" as const, 
        stiffness: 100, 
        damping: 15,
        delay: 0.3
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-5`}
        key={`bg-${currentSlide}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${slide.color} opacity-20`}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Header with logo */}
      <motion.div 
        className="flex justify-center pt-8 pb-4 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <img src={logo} alt="Volantia" className="h-10 w-auto" />
      </motion.div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center text-center max-w-sm w-full"
          >
            {/* Icon container with animated icon */}
            <motion.div 
              variants={iconContainerVariants}
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-6 shadow-lg relative`}
            >
              {/* Glow effect */}
              <motion.div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${slide.color} blur-xl opacity-50`}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                animate={slide.iconAnimation.animate}
                transition={slide.iconAnimation.transition}
                className="relative z-10"
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* Title with staggered animation */}
            <motion.h1 
              variants={itemVariants}
              className="text-2xl font-bold text-foreground mb-3"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground text-sm leading-relaxed mb-6"
            >
              {slide.description}
            </motion.p>

            {/* App mockup preview */}
            <motion.div
              variants={mockupVariants}
              className="w-full max-w-xs"
            >
              <MockupComponent />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-4 relative z-10">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-colors duration-300 ${
              index === currentSlide 
                ? 'bg-brand-500' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            animate={{ 
              width: index === currentSlide ? 32 : 8,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between px-6 pb-8 gap-4 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isFirstSlide ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            onClick={prevSlide}
            disabled={isFirstSlide}
            className={isFirstSlide ? 'invisible' : ''}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Anterior
          </Button>
        </motion.div>

        {!isLastSlide && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-muted-foreground"
          >
            Saltar
          </Button>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={nextSlide}
            className="bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25"
          >
            {isLastSlide ? 'Empezar' : 'Siguiente'}
            {!isLastSlide && <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
