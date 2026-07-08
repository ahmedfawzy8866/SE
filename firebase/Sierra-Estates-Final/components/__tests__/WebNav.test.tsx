import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WebNav } from '../WebNav';
import { router } from 'expo-router';

// Mock the context providers so they don't break
jest.mock('@/hooks/useColors', () => ({
  useColors: () => ({ background: '#fff', border: '#ccc', text: '#000', gold: '#ffd700' }),
}));

jest.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({ 
    t: { brandName: 'Sierra', navHome: 'Home', navSearch: 'Search', navMap: 'Map' }, 
    isRTL: false, 
    toggleLanguage: jest.fn(), 
    language: 'en' 
  }),
}));

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

jest.mock('@/context/ClaimContext', () => ({
  useClaim: () => ({ hasClaimed: false }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  usePathname: () => '/',
}));

describe('WebNav Navigation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to /(tabs)/index when logo brand name is clicked', async () => {
    const { getByText } = await (render(<WebNav />) as any);
    
    fireEvent.press(getByText('Sierra'));
    
    expect(router.push).toHaveBeenCalledWith('/(tabs)/index');
  });

  it('navigates to /listings when Compounds filter is clicked', async () => {
    const { getByText } = await (render(<WebNav />) as any);
    
    fireEvent.press(getByText('Compounds'));
    
    expect(router.push).toHaveBeenCalledWith('/listings');
  });
});
