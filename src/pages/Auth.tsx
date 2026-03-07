import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { PageTransition } from '@/components/layout/PageTransition';
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

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate form
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
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: '❌ Error de acceso',
              description: 'Email o contraseña incorrectos',
              variant: 'destructive',
            });
          } else {
            toast({
              title: '❌ Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: '✅ ¡Bienvenido!',
            description: 'Has iniciado sesión correctamente',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.displayName);
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: '❌ Error',
              description: 'Este email ya está registrado',
              variant: 'destructive',
            });
          } else {
            toast({
              title: '❌ Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: '✅ ¡Cuenta creada!',
            description: 'Ya puedes empezar a usar Volantia',
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Ha ocurrido un error inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary shadow-lg">
          <Truck className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Volantia</h1>
        <p className="text-muted-foreground">Control Horario Pro</p>
      </div>

      {/* Form Card */}
      <GlassCard className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'Accede a tu cuenta' : 'Regístrate para sincronizar tus datos'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nombre
              </Label>
              <Input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                placeholder="Tu nombre"
                className={cn('mt-1 rounded-xl', errors.displayName && 'border-destructive')}
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-destructive">{errors.displayName}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className={cn('mt-1 rounded-xl', errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Contraseña
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                className={cn('rounded-xl pr-10', errors.password && 'border-destructive')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className={cn('mt-1 rounded-xl', errors.confirmPassword && 'border-destructive')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full rounded-xl py-6">
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

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="ml-1 font-medium text-primary hover:underline"
            >
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </GlassCard>

      {/* Guest Mode */}
      <Link to="/" className="mt-6">
        <Button variant="ghost" className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continuar como invitado
        </Button>
      </Link>

      <p className="mt-4 max-w-xs text-center text-xs text-muted-foreground">
        El modo invitado guarda tus datos solo en este dispositivo. 
        Regístrate para sincronizar entre dispositivos.
      </p>

      <div className="mt-8 text-center">
        <Link 
          to="/privacy" 
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
        >
          Política de Privacidad
        </Link>
      </div>
    </PageTransition>
  );
}
