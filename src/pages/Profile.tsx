import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Camera, LogOut, Trash2, Cloud, CloudOff, Settings, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageTransition } from '@/components/layout/PageTransition';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  display_name: string;
  avatar_url: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState<Profile>({ display_name: 'Conductor', avatar_url: null });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile>({ display_name: '', avatar_url: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile({ display_name: 'Invitado', avatar_url: null });
      setIsLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFormData(data);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: formData.display_name })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } else {
      setProfile(formData);
      setIsEditing(false);
      toast({
        title: '✅ Perfil actualizado',
        description: 'Tus datos se han guardado correctamente.',
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: '👋 Hasta pronto',
      description: 'Has cerrado sesión correctamente',
    });
    navigate('/');
  };

  const handleClearData = () => {
    if (confirm('¿Estás seguro? Se eliminarán todos tus datos locales.')) {
      localStorage.clear();
      toast({
        title: '🗑️ Datos eliminados',
        description: 'Se han borrado todos los datos locales.',
      });
      navigate('/');
      window.location.reload();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <AppLayout showNavigation={false} showHeader={false}>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showNavigation={false} showHeader={false}>
      <PageTransition>
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Mi Perfil</h1>
            <p className="text-sm text-muted-foreground">Gestiona tu cuenta</p>
          </div>
        </div>

        {/* Avatar Section */}
        <GlassCard className="flex flex-col items-center py-8">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {getInitials(profile.display_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 text-xl font-semibold">{profile.display_name}</h2>
          <p className="text-sm text-muted-foreground">
            {user?.email || 'Modo invitado'}
          </p>
          <span className={`mt-2 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            user ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
          }`}>
            {user ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
            {user ? 'Sincronizado' : 'Modo Local'}
          </span>
        </GlassCard>

        {/* Profile Form */}
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <User className="h-5 w-5 text-primary" />
              Datos personales
            </h3>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="rounded-xl"
              >
                {isEditing ? 'Guardar' : 'Editar'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Nombre</Label>
              <Input
                id="displayName"
                value={isEditing ? formData.display_name : profile.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                disabled={!isEditing}
                className="mt-1 rounded-xl"
              />
            </div>
            {user && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="mt-1 rounded-xl"
                />
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Settings Access */}
        <GlassCard 
          className="cursor-pointer transition-all hover:bg-accent/50"
          onClick={() => navigate('/settings')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Ajustes de tarifas</h3>
                <p className="text-sm text-muted-foreground">Configura dietas, horas extra, km...</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </GlassCard>

        {/* Account Info */}
        <GlassCard>
          <h3 className="mb-4 font-semibold">Información de cuenta</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado</span>
              <span className="font-medium">{user ? 'Cuenta activa' : 'Modo Invitado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sincronización</span>
              <span className={`font-medium ${user ? 'text-success' : 'text-warning'}`}>
                {user ? 'Activada' : 'Desactivada'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Almacenamiento</span>
              <span className="font-medium">{user ? 'Cloud' : 'Local'}</span>
            </div>
          </div>

          {!user && (
            <div className="mt-4 rounded-xl bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                💡 Regístrate para sincronizar tus datos entre dispositivos y no perder tu información.
              </p>
              <Button onClick={() => navigate('/auth')} className="mt-3 w-full rounded-xl">
                Crear cuenta
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Actions */}
        {user ? (
          <GlassCard>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full rounded-xl"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </GlassCard>
        ) : (
          <GlassCard className="border-destructive/20">
            <h3 className="mb-4 font-semibold text-destructive">Zona de peligro</h3>
            <Button
              variant="outline"
              onClick={handleClearData}
              className="w-full rounded-xl border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Borrar todos los datos locales
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Esta acción no se puede deshacer
            </p>
          </GlassCard>
        )}
      </div>
      </PageTransition>
    </AppLayout>
  );
}
