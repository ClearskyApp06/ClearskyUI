// @ts-check
// <reference path="../api.d.ts" />

import React from 'react';

import { isPromise, resolveHandleOrDID } from '../../api';
import { SearchEntryLayout } from './search-entry-layout';

/**
 * @extends {React.Component<{ entry: SearchMatch }, { }>}
 */
export class SearchEntryDisplay extends React.Component {
  /** @type {string} */
  shortDID;

  /** @type {Promise | undefined} */
  promise;

  /** @type {AccountInfo | undefined} */
  account;

  /** @type {Error | undefined} */
  error;

  render() {
    if (this.shortDID !== this.props.entry.shortDID) {
      this.shortDID = this.props.entry.shortDID;
      const accountOrPromise = resolveHandleOrDID(this.shortDID);

      if (isPromise(accountOrPromise)) {
        this.promise = accountOrPromise;
        this.account = undefined;
        this.error = undefined;
        accountOrPromise.then(
          account => {
            this.promise = undefined;
            this.account = account;
            this.error = undefined;
            this.setState(account);
          },
          error => {
            this.promise = undefined;
            this.account = undefined;
            this.error = error;
            this.setState(error);
          });
      } else {
        this.promise = undefined;
        this.account = accountOrPromise;
        this.error = undefined;
      }
    }

    if (this.error) {
      return <ResolveFailure {...this.props} error={this.error} />;
    } else if (this.account) {
      return <ResolveSuccess {...this.props} account={this.account} />;
    } else {
      return <ResolvingMatch {...this.props} />;
    }
  }
}

/** @param {{ entry: SearchMatch, error: Error }} _ */
function ResolveFailure({ error, ...rest }) {
  return (
    <SearchEntryLayout {...rest} className='resolve-failure-item'>
      <>
        {error?.constructor?.name ? <span className='error-constructor-name'>{error.constructor.name}</span> : undefined}
        {error?.message ? <span className='error-message'>{error.message}</span> : undefined}
        {error?.stack && error.stack !== error.message ?
          <span className='error-stack'>{error.stack.replace(error.message || '', '')}</span> : undefined}
      </>
    </SearchEntryLayout>
  );
}

/**
 * @param {{ entry: SearchMatch }} _
 */
function ResolvingMatch({ ...rest }) {
  return (
    <SearchEntryLayout {...rest} />
  );
}

/** @param {{ entry: SearchMatch, account: AccountInfo, className?: string }} _ */
function ResolveSuccess({ className, ...rest }) {
  return (
    <SearchEntryLayout {...rest} className={'resolve-success-item ' + (className || '')} />
  );
}