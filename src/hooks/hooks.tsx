import React, { ReactNode, useEffect, useState } from 'react';
import { TVService, TVideoProvider } from '@/services';

const isDev = process.env.NODE_ENV !== 'production';

export const UIContext = React.createContext<any>(null);

if (isDev) {
  UIContext.displayName = '__DGZ_UIContext___';
}

export interface UIProviderProps {
  children: ReactNode | Function;
}

export const UIProvider = (props: UIProviderProps) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return <UIContext.Provider
    value={{
      ...TVService.czzy,
    } as SDKType}
  >
    {
      typeof props.children === 'function' ? props.children() : props?.children
    }
  </UIContext.Provider>
}

const NO_INSETS_ERROR =
  'Make sure you are rendering `<UIProvider>` at the top of your app.';

export function useUI(): SDKType {
  const sdk = React.useContext(UIContext);
  if (sdk == null) {
    throw new Error(NO_INSETS_ERROR);
  }
  return sdk || {};
}

export interface SDKType extends TVideoProvider {

}
