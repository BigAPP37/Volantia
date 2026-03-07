import { useState } from 'react';
import { Fuel, Receipt, ParkingCircle, MoreHorizontal, Plus, X, Camera, Check, Image } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ExpenseType, EXPENSE_TYPES } from '@/types/expense';
import { TicketScanner } from './TicketScanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LocalExpense {
  id: string;
  expense_type: ExpenseType;
  amount: number;
  description?: string;
  ticket_image_url?: string;
  is_company_paid: boolean;
}

interface ExpenseInputProps {
  expenses: LocalExpense[];
  onAdd: (type: ExpenseType, data?: { amount?: number; description?: string; ticket_image_url?: string }) => void;
  onUpdate: (id: string, updates: Partial<LocalExpense>) => void;
  onRemove: (id: string) => void;
}

const iconMap = {
  fuel: Fuel,
  toll: Receipt,
  parking: ParkingCircle,
  other: MoreHorizontal,
};

export function ExpenseInput({ expenses, onAdd, onUpdate, onRemove }: ExpenseInputProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleScanComplete = (data: {
    expense_type: ExpenseType;
    amount: number;
    description?: string;
    imageUrl?: string;
  }) => {
    onAdd(data.expense_type, {
      amount: data.amount,
      description: data.description,
      ticket_image_url: data.imageUrl,
    });
    setShowScanner(false);
  };

  // Calculate totals
  const userTotal = expenses
    .filter(e => !e.is_company_paid)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const companyTotal = expenses
    .filter(e => e.is_company_paid)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-3">
      {/* Scan ticket button */}
      {!showScanner && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowScanner(true)}
          className="w-full h-12 border-dashed border-2 flex items-center justify-center gap-2"
        >
          <Camera className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Escanear Ticket con IA</span>
        </Button>
      )}

      {/* Ticket scanner */}
      {showScanner && (
        <div className="rounded-lg border bg-card p-4">
          <TicketScanner
            onScanComplete={handleScanComplete}
            onCancel={() => setShowScanner(false)}
          />
        </div>
      )}

      {/* Quick add buttons */}
      <div className="flex flex-wrap gap-2">
        {EXPENSE_TYPES.map(({ value, label }) => {
          const Icon = iconMap[value];
          return (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAdd(value)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Icon className="h-3.5 w-3.5" />
              <Plus className="h-3 w-3" />
              {label}
            </Button>
          );
        })}
      </div>

      {/* Expense list */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map((expense) => {
            const typeInfo = EXPENSE_TYPES.find(t => t.value === expense.expense_type);
            const Icon = iconMap[expense.expense_type];
            
            return (
              <div 
                key={expense.id} 
                className={`rounded-lg p-3 space-y-2 ${
                  expense.is_company_paid 
                    ? 'bg-green-500/10 border border-green-500/30' 
                    : 'bg-muted/50'
                }`}
              >
                {/* Top row */}
                <div className="flex items-center gap-2">
                  {/* Icon + type */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  
                  <span className="text-xs font-medium text-muted-foreground min-w-[50px]">
                    {typeInfo?.label}
                  </span>

                  {/* Amount */}
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={expense.amount || ''}
                    onChange={(e) => onUpdate(expense.id, { amount: parseFloat(e.target.value) || 0 })}
                    className="h-8 w-20 text-right text-sm"
                  />
                  <span className="text-xs text-muted-foreground">€</span>

                  {/* Ticket image indicator */}
                  {expense.ticket_image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewImage(expense.ticket_image_url || null)}
                      className="h-8 w-8 text-primary"
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Delete button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(expense.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Bottom row - Description + Company paid toggle */}
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Nota..."
                    value={expense.description || ''}
                    onChange={(e) => onUpdate(expense.id, { description: e.target.value })}
                    className="h-8 flex-1 text-xs"
                  />
                  
                  {/* Company paid toggle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch
                      id={`paid-${expense.id}`}
                      checked={expense.is_company_paid}
                      onCheckedChange={(checked) => onUpdate(expense.id, { is_company_paid: checked })}
                      className="scale-75"
                    />
                    <Label 
                      htmlFor={`paid-${expense.id}`}
                      className={`text-xs cursor-pointer ${
                        expense.is_company_paid ? 'text-green-500 font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {expense.is_company_paid ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Cobrado
                        </span>
                      ) : (
                        'Cobrado'
                      )}
                    </Label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Totals */}
      {expenses.length > 0 && (
        <div className="space-y-2">
          {/* User expenses */}
          {userTotal > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2">
              <span className="text-xs font-medium text-destructive">Mis Gastos</span>
              <span className="text-sm font-bold text-destructive">
                -{userTotal.toFixed(2)} €
              </span>
            </div>
          )}
          
          {/* Company paid expenses */}
          {companyTotal > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2">
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                Pagados por Empresa
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {companyTotal.toFixed(2)} €
              </span>
            </div>
          )}
        </div>
      )}

      {/* Image preview dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Ticket" 
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
