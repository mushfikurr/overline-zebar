import { useContext } from 'react';
import { ConfigDispatchContext, ConfigStateContext } from '../ConfigReducer';

export function useConfigState() {
  const context = useContext(ConfigStateContext);
  if (context === undefined) {
    throw new Error('useConfigState must be used within ConfigProvider');
  }
  return context;
}

export function useConfigDispatch() {
  const context = useContext(ConfigDispatchContext);
  if (context === undefined) {
    throw new Error('useConfigDispatch must be used within ConfigProvider');
  }
  return context;
}
