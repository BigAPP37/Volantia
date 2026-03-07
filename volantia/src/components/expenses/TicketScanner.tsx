import { useState, useRef } from 'react';
import { Camera, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ExpenseType, EXPENSE_TYPES } from '@/types/expense';
import { toast } from 'sonner';

interface ScannedData {
  expense_type: ExpenseType;
  amount: number;
  description?: string;
  confidence: number;
  imageUrl?: string;
}

interface TicketScannerProps {
  onScanComplete: (data: ScannedData) => void;
  onCancel: () => void;
}

export function TicketScanner({ onScanComplete, onCancel }: TicketScannerProps) {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsScanning(true);

    try {
      // Convert to base64 for AI processing
      const base64 = await fileToBase64(file);

      // Call AI to analyze the ticket
      const { data: aiData, error: aiError } = await supabase.functions.invoke('scan-ticket', {
        body: { imageBase64: base64 }
      });

      if (aiError) throw aiError;

      if (!aiData?.success) {
        throw new Error(aiData?.error || 'Error al analizar el ticket');
      }

      // Upload image to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('ticket-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading ticket image:', uploadError);
        // Continue without image URL
      }

      // Get public URL
      let imageUrl: string | undefined;
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('ticket-images')
          .getPublicUrl(fileName);
        imageUrl = urlData?.publicUrl;
      }

      const result: ScannedData = {
        ...aiData.data,
        imageUrl,
      };

      setScannedData(result);
      toast.success('Ticket escaneado correctamente');

    } catch (error) {
      console.error('Error scanning ticket:', error);
      toast.error(error instanceof Error ? error.message : 'Error al escanear el ticket');
      setPreview(null);
    } finally {
      setIsScanning(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleConfirm = () => {
    if (scannedData) {
      onScanComplete(scannedData);
    }
  };

  const handleRetry = () => {
    setPreview(null);
    setScannedData(null);
    fileInputRef.current?.click();
  };

  const typeLabel = scannedData 
    ? EXPENSE_TYPES.find(t => t.value === scannedData.expense_type)?.label 
    : '';

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview && !isScanning && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-24 border-dashed border-2 flex flex-col items-center justify-center gap-2"
        >
          <Camera className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Toca para escanear ticket
          </span>
        </Button>
      )}

      {isScanning && (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-muted/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-sm text-muted-foreground">Analizando ticket...</span>
        </div>
      )}

      {preview && scannedData && (
        <div className="space-y-4">
          {/* Preview image */}
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={preview} 
              alt="Ticket" 
              className="w-full h-40 object-cover"
            />
            {scannedData.confidence < 70 && (
              <div className="absolute top-2 right-2 bg-yellow-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Verificar datos
              </div>
            )}
          </div>

          {/* Extracted data */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <h4 className="text-sm font-medium">Datos extraídos:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-muted-foreground">Tipo</span>
                <p className="text-sm font-medium">{typeLabel}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Importe</span>
                <p className="text-sm font-bold text-destructive">
                  -{scannedData.amount.toFixed(2)} €
                </p>
              </div>
            </div>
            
            {scannedData.description && (
              <div>
                <span className="text-xs text-muted-foreground">Descripción</span>
                <p className="text-sm">{scannedData.description}</p>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Confianza: {scannedData.confidence}%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRetry}
              className="flex-1"
            >
              Reintentar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Añadir
            </Button>
          </div>
        </div>
      )}

      {!preview && !isScanning && (
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="w-full text-sm text-muted-foreground"
        >
          Cancelar
        </Button>
      )}
    </div>
  );
}
