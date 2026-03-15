import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, Clock, AlertTriangle, BookOpen, Euro, Truck, Moon, Coffee, Calendar, Shield, ExternalLink } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

// ─── Data ────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'tiempos-conduccion',
    icon: Truck,
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.12)',
    title: 'Tiempos de Conducción',
    subtitle: 'Límites diarios y semanales',
    articles: [
      {
        tag: 'Diario',
        tagColor: '#3b82f6',
        title: '9h máximo al día',
        body: 'Un conductor no puede conducir más de 9 horas entre dos períodos de descanso diario. Se puede ampliar a 10h un máximo de 2 veces por semana.',
        highlight: '⚡ 2 veces por semana puedes ampliar a 10h',
      },
      {
        tag: 'Semanal',
        tagColor: '#8b5cf6',
        title: '56h máximo a la semana',
        body: 'El tiempo de conducción semanal no puede superar las 56 horas. Esto incluye todos los días de la semana de lunes a domingo.',
        highlight: '📅 La semana empieza siempre el lunes a las 00:00',
      },
      {
        tag: 'Quincenal',
        tagColor: '#22c55e',
        title: '90h en dos semanas consecutivas',
        body: 'En cualquier período de dos semanas consecutivas, el tiempo total de conducción no puede superar las 90 horas.',
        highlight: '✅ Si conduces 56h una semana → máx. 34h la siguiente',
      },
    ],
  },
  {
    id: 'pausas',
    icon: Coffee,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
    title: 'Pausas Obligatorias',
    subtitle: 'Cuándo y cómo descansar',
    articles: [
      {
        tag: 'Regla básica',
        tagColor: '#f59e0b',
        title: '45 min tras 4,5h de conducción',
        body: 'Después de 4 horas y 30 minutos de conducción acumulada, debes tomar una pausa de al menos 45 minutos. Esta pausa no puede dividirse en períodos de menos de 15 minutos.',
        highlight: '☕ La pausa puede dividirse: primero 15 min, luego 30 min',
      },
      {
        tag: 'División',
        tagColor: '#f97316',
        title: 'Pausa en dos partes',
        body: 'La pausa de 45 min puede fraccionarse en dos períodos: el primero de al menos 15 minutos y el segundo de al menos 30 minutos. Deben tomarse en ese orden.',
        highlight: '⚠️ El orden importa: 15 min primero, 30 min después',
      },
      {
        tag: 'Importante',
        tagColor: '#ef4444',
        title: 'Qué NO cuenta como pausa',
        body: 'Las interrupciones en ferry o tren sí cuentan como pausa si el conductor puede moverse libremente. El tiempo de carga/descarga NO cuenta como pausa a menos que el conductor esté completamente liberado.',
        highlight: '🚢 En ferry/tren sí cuenta · 📦 Carga/descarga NO cuenta',
      },
    ],
  },
  {
    id: 'descanso-diario',
    icon: Moon,
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.12)',
    title: 'Descanso Diario',
    subtitle: 'Entre jornadas de trabajo',
    articles: [
      {
        tag: 'Normal',
        tagColor: '#22c55e',
        title: '11 horas de descanso continuo',
        body: 'El descanso diario normal es de 11 horas ininterrumpidas dentro de un período de 24 horas. Este es el mínimo habitual.',
        highlight: '✅ 11h seguidas = descanso diario correcto',
      },
      {
        tag: 'Reducido',
        tagColor: '#f59e0b',
        title: 'Puede reducirse a 9h',
        body: 'El descanso diario puede reducirse a 9 horas consecutivas, pero solo 3 veces entre dos descansos semanales. No hay que compensar este tiempo reducido.',
        highlight: '📌 Máx. 3 veces entre dos descansos semanales',
      },
      {
        tag: 'Fraccionado',
        tagColor: '#8b5cf6',
        title: 'En dos períodos: 3h + 9h',
        body: 'El descanso puede fraccionarse en dos períodos: el primero de al menos 3 horas y el segundo de al menos 9 horas. Total: 12 horas mínimo.',
        highlight: '🕐 Primero 3h, después 9h — en ese orden',
      },
      {
        tag: 'A bordo',
        tagColor: '#3b82f6',
        title: 'Descanso en la cabina',
        body: 'Si el vehículo está equipado con litera homologada y parado, el conductor puede tomar su descanso en la cabina. La litera debe cumplir los requisitos del Reglamento (UE) 165/2014.',
        highlight: '🛏️ La litera debe estar homologada y el vehículo parado',
      },
    ],
  },
  {
    id: 'descanso-semanal',
    icon: Calendar,
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.1)',
    title: 'Descanso Semanal',
    subtitle: 'Obligatorio cada semana',
    articles: [
      {
        tag: 'Normal',
        tagColor: '#22c55e',
        title: '45 horas de descanso semanal',
        body: 'El descanso semanal normal es de 45 horas ininterrumpidas. Debe iniciarse como máximo al final del sexto día desde el comienzo de la semana.',
        highlight: '✅ 45h seguidas antes del 6.º día de trabajo',
      },
      {
        tag: 'Reducido',
        tagColor: '#f59e0b',
        title: 'Puede reducirse a 24h',
        body: 'El descanso semanal puede reducirse a 24 horas consecutivas, pero las horas que se reduzcan deben compensarse antes del final de la tercera semana siguiente.',
        highlight: '⚠️ La reducción hay que compensarla en las próximas 3 semanas',
      },
      {
        tag: 'Compensación',
        tagColor: '#ef4444',
        title: 'Cómo compensar la reducción',
        body: 'Las horas de reducción se compensan unidas a otro período de descanso de al menos 9 horas. La compensación debe tomarse antes de que terminen las 3 semanas siguientes a la semana de reducción.',
        highlight: '📋 Compensar antes del final de la 3.ª semana siguiente',
      },
      {
        tag: 'Internacional',
        tagColor: '#3b82f6',
        title: 'Fuera del país de base',
        body: 'El conductor que realiza transporte internacional puede tomar dos descansos semanales reducidos consecutivos si en las siguientes 3 semanas compensa ambas reducciones.',
        highlight: '🌍 2 reducciones consecutivas si compensas en 3 semanas',
      },
    ],
  },
  {
    id: 'multas',
    icon: AlertTriangle,
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.1)',
    title: 'Infracciones y Multas',
    subtitle: 'Lo que puede costar no cumplir',
    articles: [
      {
        tag: 'Leve',
        tagColor: '#22c55e',
        title: 'Infracciones leves: hasta 500€',
        body: 'Pequeñas superaciones de los tiempos de conducción o pausas (menos del 10% sobre el límite). Retraso en inserción de hojas o tarjeta al inicio de la jornada.',
        highlight: '📄 Ejemplo: superar 4,5h de conducción en menos de 27 min',
      },
      {
        tag: 'Grave',
        tagColor: '#f59e0b',
        title: 'Infracciones graves: 500€ – 2.000€',
        body: 'Superación del tiempo de conducción diario entre el 10% y el 25%. No tomar las pausas reglamentarias. No llevar hojas de registro o tarjeta del conductor.',
        highlight: '🚫 Puede conllevar paralización del vehículo',
      },
      {
        tag: 'Muy grave',
        tagColor: '#ef4444',
        title: 'Muy graves: desde 2.000€',
        body: 'Superar el tiempo de conducción en más del 25%. Manipulación o fraude del tacógrafo. Conducir sin tarjeta de conductor válida. Descanso semanal inferior al mínimo.',
        highlight: '🔴 Puede suponer retirada del carnet + paralización',
      },
      {
        tag: 'Tacógrafo',
        tagColor: '#8b5cf6',
        title: 'Manipulación: consecuencias penales',
        body: 'La manipulación del tacógrafo o el uso de dispositivos para alterar su funcionamiento es un delito que puede derivar en responsabilidad penal tanto para el conductor como para la empresa.',
        highlight: '⚖️ No es solo multa — puede llegar a juicio penal',
      },
    ],
  },
  {
    id: 'tacografo-digital',
    icon: Clock,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.1)',
    title: 'Tacógrafo Digital',
    subtitle: 'Uso correcto de la tarjeta',
    articles: [
      {
        tag: 'Al inicio',
        tagColor: '#22c55e',
        title: 'Insertar tarjeta al empezar',
        body: 'Al iniciar la jornada debes introducir tu tarjeta de conductor en la ranura 1 del tacógrafo. Si viene de otro vehículo, el aparato puede pedirte que introduzcas datos manualmente de hasta los últimos 28 días.',
        highlight: '🃏 Tarjeta siempre en ranura 1 (izquierda)',
      },
      {
        tag: 'Modos',
        tagColor: '#3b82f6',
        title: 'Los 4 modos del tacógrafo',
        body: '🚗 Conducción (automático) · ☕ Pausa/Descanso · ⚙️ Otros trabajos (carga, espera) · 🏠 Disponibilidad. Es tu responsabilidad que el modo activo sea el correcto.',
        highlight: '⚙️ Cambiar a "Otros trabajos" durante carga/espera',
      },
      {
        tag: 'Al terminar',
        tagColor: '#f59e0b',
        title: 'Extraer tarjeta al acabar',
        body: 'Al finalizar la jornada debes retirar la tarjeta. El tacógrafo guarda automáticamente el período de descanso. Si dejas la tarjeta puesta, el aparato registrará como trabajo todo el tiempo de descanso.',
        highlight: '❗ Sacar la tarjeta al acabar — o contará como trabajo',
      },
      {
        tag: 'Vigencia',
        tagColor: '#8b5cf6',
        title: 'Tarjeta válida 5 años',
        body: 'La tarjeta de conductor tiene una validez de 5 años. Debes renovarla antes de que caduque. Conducir con tarjeta caducada es infracción grave. La tramita la Jefatura Provincial de Tráfico.',
        highlight: '📅 Renueva con antelación — tramitación puede tardar semanas',
      },
      {
        tag: 'Avería',
        tagColor: '#ef4444',
        title: 'Si el tacógrafo falla',
        body: 'Si el tacógrafo se avería en ruta, el conductor debe anotar manualmente los tiempos de conducción, pausas y descansos en una hoja de papel firmada. La empresa tiene 7 días para repararlo.',
        highlight: '📝 Anotaciones manuales + firma del conductor',
      },
    ],
  },
  {
    id: 'transporte-internacional',
    icon: Shield,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.1)',
    title: 'Transporte Internacional',
    subtitle: 'Normas específicas fuera de España',
    articles: [
      {
        tag: 'Normativa',
        tagColor: '#3b82f6',
        title: 'Reglamento UE 561/2006',
        body: 'Todos los países de la UE aplican el mismo reglamento. Si viajas a países no UE (Marruecos, Reino Unido, Suiza...) deberás consultar los acuerdos AETR que pueden tener diferencias.',
        highlight: '🇪🇺 UE = mismas reglas · 🌍 Resto = verificar AETR',
      },
      {
        tag: 'Ferry/Tren',
        tagColor: '#22c55e',
        title: 'Interrupción en ferry o tren',
        body: 'Si el trayecto incluye un ferry o tren de más de 8 horas y el conductor tiene acceso a una litera, el descanso diario puede interrumpirse un máximo de 2 veces por embarque/desembarque.',
        highlight: '🚢 Mínimo 8h de trayecto + litera disponible',
      },
      {
        tag: 'Documentación',
        tagColor: '#f59e0b',
        title: 'Documentos que debes llevar',
        body: 'Tarjeta de conductor vigente · Carta de porte (CMR) · Certificado de conductor (si eres nacional de país no UE) · Autorización de transporte internacional · DNI/Pasaporte.',
        highlight: '📋 Sin CMR en internacional = paralización inmediata',
      },
    ],
  },
];

const QUICK_RULES = [
  { label: 'Conducción diaria', value: '9h', max: '10h (×2/sem)', color: '#3b82f6' },
  { label: 'Conducción semanal', value: '56h', max: '90h en 2 semanas', color: '#8b5cf6' },
  { label: 'Pausa obligatoria', value: '45 min', max: 'Cada 4,5h', color: '#f59e0b' },
  { label: 'Descanso diario', value: '11h', max: 'Mín. 9h (×3)', color: '#22c55e' },
  { label: 'Descanso semanal', value: '45h', max: 'Mín. 24h', color: '#ef4444' },
];

// ─── Components ───────────────────────────────────────────────

function QuickReference() {
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'rgba(13,22,45,0.72)', border: '1px solid rgba(59,130,246,0.1)' }}>
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-400" />
        <span className="font-semibold text-white text-sm">Referencia rápida</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {QUICK_RULES.map((rule, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-slate-400">{rule.label}</span>
            <div className="text-right">
              <span className="text-sm font-bold" style={{ color: rule.color }}>{rule.value}</span>
              <span className="text-xs text-slate-600 ml-2">{rule.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: typeof SECTIONS[0]['articles'][0] }) {
  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: `${article.tagColor}18`, color: article.tagColor }}
        >
          {article.tag}
        </span>
      </div>
      <h3 className="text-white font-semibold text-sm leading-snug">{article.title}</h3>
      <p className="text-slate-400 text-xs leading-relaxed">{article.body}</p>
      <div
        className="rounded-lg px-3 py-2 text-xs font-medium"
        style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)', color: '#93c5fd' }}
      >
        {article.highlight}
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: typeof SECTIONS[0] }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,45,0.72)', border: '1px solid rgba(59,130,246,0.1)' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 transition-all active:scale-[0.99]"
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: section.glow }}
        >
          <Icon className="h-5 w-5" style={{ color: section.color }} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-white text-sm">{section.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{section.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${section.color}15`, color: section.color }}
          >
            {section.articles.length}
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </motion.div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
              {section.articles.map((article, i) => (
                <ArticleCard key={i} article={article} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function TachographGuide() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredSections = SECTIONS.filter(s =>
    !search ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.articles.some(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <AppLayout showNavigation={true} title="Guía Tacógrafo">
      <div className="space-y-4 pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 active:scale-95" style={{ background: 'rgba(13,22,45,0.7)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Guía del Tacógrafo</h1>
            <p className="text-xs text-slate-500">Reglamento UE 561/2006 · Actualizado 2026</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl px-4 py-3 flex gap-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/70 leading-relaxed">
            Información orientativa basada en el Reglamento (UE) 561/2006. Ante dudas concretas consulta a tu empresa, sindicato o a la DGT.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Buscar en la guía..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
            style={{ background: 'rgba(13,22,45,0.72)', border: '1px solid rgba(59,130,246,0.1)' }}
          />
        </div>

        {/* Quick reference */}
        {!search && <QuickReference />}

        {/* Sections */}
        <div className="space-y-3">
          {filteredSections.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}
          {filteredSections.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Sin resultados para "{search}"</p>
            </div>
          )}
        </div>

        {/* Source */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <ExternalLink className="h-3 w-3 text-slate-600" />
          <a
            href="https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32006R0561"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 underline"
          >
            Reglamento (UE) 561/2006 — texto oficial
          </a>
        </div>

      </div>
    </AppLayout>
  );
}
