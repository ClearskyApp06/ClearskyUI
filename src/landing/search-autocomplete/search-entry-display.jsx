// @ts-check

import { useResolveHandleOrDid } from '../../api';
import { SearchEntryLayout } from './search-entry-layout';

/**
 * @param {{ entry: SearchMatch }} props
 */
export function SearchEntryDisplay(props) {
  const request = useResolveHandleOrDid(props.entry.shortDID);

  if (request.isLoading) {
    return <ResolvingMatch entry={props.entry} />;
  }
  if (request.error || !request.data) {
    return <ResolveFailure entry={props.entry} error={request.error} />;
  }
  return <ResolveSuccess {...props} account={request.data} />;
}

/** @param {{ entry: SearchMatch, error: Error | null }} _ */
function ResolveFailure({ error, ...rest }) {
  return (
    <SearchEntryLayout {...rest} className="resolve-failure-item">
      <>
        {error?.constructor?.name ? (
          <span className="error-constructor-name">
            {error.constructor.name}
          </span>
        ) : undefined}
        {error?.message ? (
          <span className="error-message">{error.message}</span>
        ) : undefined}
        {error?.stack && error.stack !== error.message ? (
          <span className="error-stack">
            {error.stack.replace(error.message || '', '')}
          </span>
        ) : undefined}
      </>
    </SearchEntryLayout>
  );
}

/**
 * @param {{ entry: SearchMatch }} _
 */
function ResolvingMatch({ ...rest }) {
  return <SearchEntryLayout {...rest} />;
}

/** @param {{ entry: SearchMatch, account: AccountInfo, className?: string }} _ */
function ResolveSuccess({ className, ...rest }) {
  return (
    <SearchEntryLayout
      {...rest}
      className={'resolve-success-item ' + (className || '')}
    />
  );
}
