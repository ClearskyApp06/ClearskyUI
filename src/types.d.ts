/// <reference types="@atproto/api" />
/// <reference types="vite/client" />

interface AccountInfo {
  shortDID: string;
  shortHandle: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  obscurePublicRecords?: boolean;
}

interface PostDetails extends AppBskyFeedPost.Record {
  uri: string;
  cid: string;
}

interface BlockedByRecord {
  blocked_date: string;
  did: string;
  status: boolean;
}

type CompactHandleOrHandleDisplayName =
  | string
  | [shortHandle: string, displayName: string];

interface SearchMatch {
  rank: number;

  shortDID: string;
  shortDIDMatches?: string;

  shortHandle: string;
  shortHandleMatches?: string;

  displayName?: string;
  displayNameMatches?: string;

  postID?: string;
}

interface ValueWithDisplayName {
  displayName?: string;
  value: string | number | undefined;
}

interface TotalUsers {
  active_count: ValueWithDisplayName;
  deleted_count: ValueWithDisplayName;
  total_count: ValueWithDisplayName;
}

interface BlockStats {
  averageNumberOfBlocked: number;
  averageNumberOfBlocks: number;
  numberBlock1: number;
  numberBlocked1: number;
  numberBlocked101and1000: number;
  numberBlocked2and100: number;
  numberBlockedGreaterThan1000: number;
  numberBlocking101and1000: number;
  numberBlocking2and100: number;
  numberBlockingGreaterThan1000: number;
  numberOfTotalBlocks: number;
  numberOfUniqueUsersBlocked: number;
  numberOfUniqueUsersBlocking: number;
  percentNumberBlocked1: number;
  percentNumberBlocked101and1000: number;
  percentNumberBlocked2and100: number;
  percentNumberBlockedGreaterThan1000: number;
  percentNumberBlocking1: number;
  percentNumberBlocking101and1000: number;
  percentNumberBlocking2and100: number;
  percentNumberBlockingGreaterThan1000: number;
  percentUsersBlocked: number;
  percentUsersBlocking: number;
  totalUsers: number;
}

interface DashboardBlockInstance {
  count: number;
  handle: string;
}

interface DashboardBlockData {
  [key: `did:${string}` /* did */]: DashboardBlockInstance;
}

interface FunFacts {
  blocked: DashboardBlockData;
  blockers: DashboardBlockData;
}

interface FunnerFacts {
  blocked24: DashboardBlockData;
  blockers24: DashboardBlockData;
}

type TopLists = FunFacts & FunnerFacts;

interface DashboardStats {
  asof: string | null;
  totalUsers: TotalUsers | null;
  blockStats: BlockStats | null;
  topLists: Partial<TopLists>;
}

type StatsEndpointResp<Data> =
  | {
      asof: string;
      data: Data;
    }
  | { timeLeft: string };

interface AccountListEntry {
  created_date: string;
  date_added: string;
  description: string;
  did: string;
  name: string;
  status: boolean;
  url: string;
}
