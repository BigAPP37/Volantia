import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WorkEntryExpense, ExpenseType } from '@/types/expense';

interface CreateExpenseInput {
  work_entry_id: string;
  expense_type: ExpenseType;
  amount: number;
  description?: string;
}

export function useWorkEntryExpenses(workEntryId?: string) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<WorkEntryExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!user || !workEntryId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('work_entry_expenses')
      .select('*')
      .eq('work_entry_id', workEntryId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching expenses:', error);
    } else {
      setExpenses(data as WorkEntryExpense[]);
    }
    setIsLoading(false);
  }, [user, workEntryId]);

  useEffect(() => {
    if (workEntryId) {
      fetchExpenses();
    }
  }, [fetchExpenses, workEntryId]);

  const addExpense = useCallback(async (expense: CreateExpenseInput) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('work_entry_expenses')
      .insert({
        work_entry_id: expense.work_entry_id,
        expense_type: expense.expense_type,
        amount: expense.amount,
        description: expense.description || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      throw error;
    }

    const newExpense = data as WorkEntryExpense;
    setExpenses((prev) => [...prev, newExpense]);
    return newExpense;
  }, [user]);

  const updateExpense = useCallback(async (id: string, updates: Partial<WorkEntryExpense>) => {
    if (!user) return;

    const { error } = await supabase
      .from('work_entry_expenses')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, [user]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('work_entry_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }

    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, [user]);

  const addMultipleExpenses = useCallback(async (expensesList: CreateExpenseInput[]) => {
    if (!user || expensesList.length === 0) return [];

    const { data, error } = await supabase
      .from('work_entry_expenses')
      .insert(expensesList.map(e => ({
        work_entry_id: e.work_entry_id,
        expense_type: e.expense_type,
        amount: e.amount,
        description: e.description || null,
      })))
      .select();

    if (error) {
      console.error('Error adding expenses:', error);
      throw error;
    }

    const newExpenses = data as WorkEntryExpense[];
    setExpenses((prev) => [...prev, ...newExpenses]);
    return newExpenses;
  }, [user]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    expenses,
    isLoading,
    addExpense,
    addMultipleExpenses,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
    totalExpenses,
  };
}
