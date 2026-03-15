import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserSettings } from '@/types';

interface PayrollScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataExtracted: (data: Partial<UserSettings>) => void;
}

interface PayrollData {
  companyName?: string;
  companyCIF?: string;
  baseSalary?: number;
  irpf?: number;
  socialSecurity?: number;
  netSalary?: number;
}

type ScanStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function PayrollScanner({ open, onOpenChange, onDataExtracted }: PayrollScannerProps) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<PayrollData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo no válido',
        description: 'Por favor selecciona una imagen (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Archivo demasiado grande',
        description: 'El archivo debe ser menor de 10MB',
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process the image
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setStatus('uploading');
    setErrorMessage('');
    setExtractedData(null);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setStatus('processing');

      // Call edge function
      const { data, error } = await supabase.functions.invoke('scan-payroll', {
        body: { imageBase64: base64 },
      });

      if (error) {
        throw new Error(error.message || 'Error al procesar la imagen');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'No se pudieron extraer datos');
      }

      if (data.data && Object.keys(data.data).length > 0) {
        setExtractedData(data.data);
        setStatus('success');
      } else {
        throw new Error('No se encontraron datos en la imagen');
      }

    } catch (error: unknown) {
      console.error('Error processing payroll:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
      setStatus('error');
    }
  };

  const handleApplyData = () => {
    if (!extractedData) return;

    const settingsUpdate: Partial<UserSettings> = {};
    
    if (extractedData.companyName) {
      settingsUpdate.companyName = extractedData.companyName;
    }
    if (extractedData.companyCIF) {
      settingsUpdate.companyCIF = extractedData.companyCIF;
    }
    if (extractedData.baseSalary) {
      settingsUpdate.baseSalary = extractedData.baseSalary;
    }
    if (extractedData.irpf) {
      settingsUpdate.irpf = extractedData.irpf;
    }
    if (extractedData.socialSecurity) {
      settingsUpdate.socialSecurity = extractedData.socialSecurity;
    }

    onDataExtracted(settingsUpdate);
    handleClose();
    
    toast({
      title: '✅ Datos aplicados',
      description: 'Los datos de la nómina se han añadido a tus ajustes',
    });
  };

  const handleClose = () => {
    setStatus('idle');
    setPreviewUrl(null);
    setExtractedData(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const handleRetry = () => {
    setStatus('idle');
    setPreviewUrl(null);
    setExtractedData(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Escanear Nómina
          </DialogTitle>
          <DialogDescription>
            Sube una foto de tu nómina y extraeremos los datos automáticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {status === 'idle' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Toca para subir imagen</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG hasta 10MB</p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Tomar foto
              </Button>
            </>
          )}

          {(status === 'uploading' || status === 'processing') && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                {status === 'uploading' ? 'Subiendo imagen...' : 'Analizando nómina con IA...'}
              </p>
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="mt-4 max-h-40 rounded-lg object-contain opacity-50"
                />
              )}
            </div>
          )}

          {status === 'success' && extractedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Datos extraídos correctamente</span>
              </div>

              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                {extractedData.companyName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Empresa:</span>
                    <span className="font-medium">{extractedData.companyName}</span>
                  </div>
                )}
                {extractedData.companyCIF && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CIF:</span>
                    <span className="font-medium">{extractedData.companyCIF}</span>
                  </div>
                )}
                {extractedData.baseSalary && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Salario Base:</span>
                    <span className="font-medium">{extractedData.baseSalary} €</span>
                  </div>
                )}
                {extractedData.irpf && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IRPF:</span>
                    <span className="font-medium">{extractedData.irpf}%</span>
                  </div>
                )}
                {extractedData.socialSecurity && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seg. Social:</span>
                    <span className="font-medium">{extractedData.socialSecurity}%</span>
                  </div>
                )}
                {extractedData.netSalary && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Neto:</span>
                    <span className="font-medium">{extractedData.netSalary} €</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  Escanear otra
                </Button>
                <Button onClick={handleApplyData} className="flex-1">
                  Aplicar datos
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error al procesar</span>
              </div>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button onClick={handleRetry} className="w-full">
                Intentar de nuevo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
