import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ONBOARDING_KEY = 'volantia_onboarding_completed';

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      const completedUsers = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
      const hasCompleted = completedUsers.includes(user.id);
      setShowOnboarding(!hasCompleted);
    } else {
      setShowOnboarding(false);
    }
    setIsLoading(false);
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      const completedUsers = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
      if (!completedUsers.includes(user.id)) {
        completedUsers.push(user.id);
        localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completedUsers));
      }
    }
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    if (user) {
      const completedUsers = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '[]');
      const filtered = completedUsers.filter((id: string) => id !== user.id);
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(filtered));
      setShowOnboarding(true);
    }
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding
  };
}
