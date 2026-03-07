import { useState } from 'react';
import { Send, Bot, User, MapPin, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: MapPin, label: 'Gasolineras cercanas', prompt: 'Busca gasolineras cercanas a mi ubicación' },
  { icon: Sparkles, label: 'Consejos financieros', prompt: 'Dame consejos para mejorar mis finanzas este mes' },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente de ruta. Puedo ayudarte a encontrar gasolineras, restaurantes o parkings cercanos, y darte consejos financieros basados en tus datos. ¿En qué puedo ayudarte?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual Gemini integration)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Esta funcionalidad requiere la integración con Google Gemini API. Habilita Lovable Cloud para activar el asistente de IA con búsqueda en Google Maps y análisis financiero personalizado.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <AppLayout title="Asistente">
      <PageTransition>
      <div className="flex h-[calc(100vh-220px)] flex-col">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-4 scrollbar-thin">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  message.role === 'user' ? 'bg-primary' : 'bg-muted'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <GlassCard
                className={cn(
                  'max-w-[80%] py-3',
                  message.role === 'user' && 'bg-primary text-primary-foreground'
                )}
                animate={false}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </GlassCard>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <GlassCard className="py-3" animate={false}>
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {quickActions.map(({ icon: Icon, label, prompt }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(prompt)}
              className="shrink-0 rounded-full"
            >
              <Icon className="mr-1 h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="rounded-full"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-full"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      </PageTransition>
    </AppLayout>
  );
}
