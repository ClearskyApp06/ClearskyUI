// @ts-check

import React, { createContext, useContext } from 'react';

import { useParams } from 'react-router-dom';
import { unwrapShortHandle } from '../api';
import { useResolveAccount } from '../common-components/use-resolve-account';

const AccountContext = createContext(
  /** @type {import('../common-components/use-resolve-account').AccountInfoResolving | undefined} */(
    undefined));

/**
 * @param {{
 *  children: React.ReactNode |
 *    ((account: import('../common-components/use-resolve-account').AccountInfoResolving) => React.ReactNode)
 * }} _
 */
export function AccountResolver({ children }) {
  let { handle } = useParams();

  const account = useResolveAccount(handle) ||
    { shortHandle: unwrapShortHandle(handle) || '*', loading: true };

  if (typeof children === 'function')
    children = children(account);

  return (
    <AccountContext.Provider value={account}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccountResolver() {
  return useContext(AccountContext);
}
