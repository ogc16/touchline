import type { OddsMarket, OddsOption, Sport, SportEvent } from '@/data/types';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

interface LeagueConfig {
  sport: Sport;
  key: string;
  path: string;
  league: string;
  region: string;
}

export const leagues: LeagueConfig[] = [
  { sport: 'Soccer', key: 'eng.1', path: 'soccer/eng.1', league: 'Premier League', region: 'England' },
  { sport: 'Soccer', key: 'esp.1', path: 'soccer/esp.1', league: 'LaLiga', region: 'Spain' },
  { sport: 'Soccer', key: 'ita.1', path: 'soccer/ita.1', league: 'Serie A', region: 'Italy' },
  { sport: 'Soccer', key: 'ger.1', path: 'soccer/ger.1', league: 'Bundesliga', region: 'Germany' },
  { sport: 'Soccer', key: 'fra.1', path: 'soccer/fra.1', league: 'Ligue 1', region: 'France' },
  { sport: 'Basketball', key: 'nba', path: 'basketball/nba', league: 'NBA', region: 'United States' },
  { sport: 'American Football', key: 'nfl', path: 'football/nfl', league: 'NFL', region: 'United States' },
  { sport: 'Ice Hockey', key: 'nhl', path: 'hockey/nhl', league: 'NHL', region: 'United States' },
  { sport: 'Baseball', key: 'mlb', path: 'baseball/mlb', league: 'MLB', region: 'United States' },
];

interface EspnTeam {
  displayName?: string;
  shortDisplayName?: string;
  name?: string;
  abbreviation?: string;
  logo?: string;
}

interface EspnCompetitor {
  homeAway?: string;
  score?: string;
  team?: EspnTeam;
}

interface EspnStatusType {
  state?: string;
  detail?: string;
  shortDetail?: string;
  description?: string;
}

interface EspnStatus {
  type?: EspnStatusType;
  displayClock?: string;
}

interface EspnMoneyLine {
  home?: unknown;
  away?: unknown;
  draw?: unknown;
}

interface EspnOdds {
  provider?: { name?: string };
  moneyline?: EspnMoneyLine;
  pointSpread?: { home?: unknown; away?: unknown };
  total?: { over?: unknown; under?: unknown; home?: unknown; away?: unknown };
}

interface EspnVenue {
  fullName?: string;
  address?: { city?: string; country?: string };
}

interface EspnCompetition {
  competitors?: EspnCompetitor[];
  odds?: EspnOdds[];
  venue?: EspnVenue;
  league?: { name?: string };
}

interface EspnEvent {
  id: string;
  date: string;
  name?: string;
  status?: EspnStatus;
  competitions?: EspnCompetition[];
}

interface EspnScoreboard {
  events?: EspnEvent[];
  leagues?: { name?: string }[];
}

interface PriceLine {
  line: string;
  odds?: string;
}

function roundOdds(value: number): number {
  return Math.round(value * 100) / 100;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function demoPrice(eventId: string, index: number): number {
  const hash = hashString(eventId);
  return roundOdds(1.55 + ((hash + index * 43) % 175) / 100);
}

export function americanToDecimal(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }
  const text = String(value).trim().replace(/^\+/, '');
  if (!text) {
    return null;
  }
  const number = Number(text);
  if (!Number.isFinite(number) || number === 0) {
    return null;
  }
  if (number > 0) {
    return roundOdds(1 + number / 100);
  }
  return roundOdds(1 + 100 / Math.abs(number));
}

function firstDecimal(...values: unknown[]): number | null {
  for (const value of values) {
    const decimal = americanToDecimal(value);
    if (decimal) {
      return decimal;
    }
  }
  return null;
}

function parsePriceLine(value: unknown): PriceLine {
  if (typeof value === 'string') {
    const parts = value.trim().split(/\s+/);
    const oddsPart = [...parts].reverse().find((part) => /^[+-]?\d+$/.test(part));
    const line = oddsPart ? parts.filter((part) => part !== oddsPart).join(' ') : value.trim();
    return { line: line || '-', odds: oddsPart };
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return {
      line: String(record.line ?? record.display ?? record.handicap ?? '-'),
      odds:
        record.odds === undefined || record.odds === null
          ? undefined
          : String(record.odds),
    };
  }
  return { line: '-' };
}

function statusFromEvent(event: EspnEvent): Pick<
  SportEvent,
  'status' | 'minute' | 'statusDetail'
> {
  const state = event.status?.type?.state;
  const status: SportEvent['status'] =
    state === 'in' ? 'live' : state === 'post' ? 'finished' : 'upcoming';
  const statusDetail =
    event.status?.type?.detail ??
    event.status?.type?.shortDetail ??
    event.status?.type?.description ??
    (status === 'live' ? 'In progress' : status === 'finished' ? 'Final' : 'Scheduled');
  const minute = status === 'live' ? event.status?.displayClock ?? statusDetail : undefined;
  return { status, minute, statusDetail };
}

function dateLabelFromIso(iso: string): string {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) {
    return 'Today';
  }
  const now = new Date();
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const difference = Math.round((startDay - today) / 86400000);
  if (difference === 0) {
    return 'Today';
  }
  if (difference === 1) {
    return 'Tomorrow';
  }
  if (difference === -1) {
    return 'Yesterday';
  }
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(start);
}

function kickoffFromIso(iso: string): string {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) {
    return '--:--';
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(start);
}

function competitorFor(competitors: EspnCompetitor[] | undefined, side: 'home' | 'away') {
  return competitors?.find((competitor) => competitor.homeAway === side);
}

function teamName(competitor: EspnCompetitor | undefined, fallback: string): string {
  return (
    competitor?.team?.shortDisplayName ??
    competitor?.team?.displayName ??
    competitor?.team?.name ??
    fallback
  );
}

function abbreviation(value: string | undefined, fallback: string): string {
  return (value ?? fallback).slice(0, 3).toUpperCase();
}

function makeOption(eventId: string, key: string, label: string, odds: number): OddsOption {
  return { id: `${eventId}-${key}`, label, odds };
}

function buildMarkets(
  eventId: string,
  sport: Sport,
  homeAbbr: string,
  awayAbbr: string,
  odds: EspnOdds | undefined,
  primary: OddsOption[],
): OddsMarket[] {
  const markets: OddsMarket[] = [
    {
      id: `${eventId}-ml`,
      title: primary.length === 3 ? 'Match result' : 'Moneyline',
      hint: sport === 'Soccer' ? 'Full time' : 'Game',
      options: primary,
    },
  ];

  const spreadHome = parsePriceLine(odds?.pointSpread?.home);
  const spreadAway = parsePriceLine(odds?.pointSpread?.away);
  if (spreadHome.odds && spreadAway.odds) {
    const homeOdds = americanToDecimal(spreadHome.odds) ?? demoPrice(eventId, 3);
    const awayOdds = americanToDecimal(spreadAway.odds) ?? demoPrice(eventId, 4);
    markets.push({
      id: `${eventId}-spread`,
      title: sport === 'Soccer' ? 'Handicap' : 'Point spread',
      hint: 'Including score',
      options: [
        makeOption(eventId, 'spread-home', `${homeAbbr} ${spreadHome.line}`, homeOdds),
        makeOption(eventId, 'spread-away', `${awayAbbr} ${spreadAway.line}`, awayOdds),
      ],
    });
  }

  const totalOver = parsePriceLine(odds?.total?.over ?? odds?.total?.home);
  const totalUnder = parsePriceLine(odds?.total?.under ?? odds?.total?.away);
  if (totalOver.odds && totalUnder.odds) {
    const overOdds = americanToDecimal(totalOver.odds) ?? demoPrice(eventId, 5);
    const underOdds = americanToDecimal(totalUnder.odds) ?? demoPrice(eventId, 6);
    const totalLine = totalOver.line !== '-' ? totalOver.line : totalUnder.line;
    markets.push({
      id: `${eventId}-total`,
      title: sport === 'Soccer' ? 'Total goals' : 'Total points',
      hint: 'Over / under',
      options: [
        makeOption(eventId, 'total-over', `Over ${totalLine}`, overOdds),
        makeOption(eventId, 'total-under', `Under ${totalLine}`, underOdds),
      ],
    });
  }

  return markets;
}

function mapEvent(
  source: EspnEvent,
  config: LeagueConfig,
  index: number,
  scoreboard: EspnScoreboard,
): SportEvent {
  const competition = source.competitions?.[0];
  const home = competitorFor(competition?.competitors, 'home');
  const away = competitorFor(competition?.competitors, 'away');
  const homeName = teamName(home, 'Home');
  const awayName = teamName(away, 'Away');
  const homeAbbr = abbreviation(home?.team?.abbreviation, homeName);
  const awayAbbr = abbreviation(away?.team?.abbreviation, awayName);
  const odds = competition?.odds?.[0];
  const status = statusFromEvent(source);
  const homeOdds =
    firstDecimal(odds?.moneyline?.home) ?? demoPrice(source.id, index * 3 + 0);
  const awayOdds =
    firstDecimal(odds?.moneyline?.away) ?? demoPrice(source.id, index * 3 + 2);
  const drawOdds = firstDecimal(odds?.moneyline?.draw);

  const options: OddsOption[] =
    config.sport === 'Soccer'
      ? [
          makeOption(source.id, 'ml-home', '1', homeOdds),
          makeOption(source.id, 'ml-draw', 'X', drawOdds ?? demoPrice(source.id, index * 3 + 1)),
          makeOption(source.id, 'ml-away', '2', awayOdds),
        ]
      : [
          makeOption(source.id, 'ml-home', homeAbbr, homeOdds),
          makeOption(source.id, 'ml-away', awayAbbr, awayOdds),
        ];

  const venue = competition?.venue;
  const region =
    venue?.address?.city ??
    venue?.address?.country ??
    scoreboard.leagues?.[0]?.name ??
    config.region;

  return {
    id: source.id,
    sport: config.sport,
    league: competition?.league?.name ?? scoreboard.leagues?.[0]?.name ?? config.league,
    leagueKey: config.key,
    region,
    home: homeName,
    away: awayName,
    homeAbbr,
    awayAbbr,
    homeLogo: home?.team?.logo,
    awayLogo: away?.team?.logo,
    kickoff: kickoffFromIso(source.date),
    dateLabel: dateLabelFromIso(source.date),
    status: status.status,
    minute: status.minute,
    statusDetail: status.statusDetail,
    homeScore: home?.score === undefined ? undefined : Number(home.score),
    awayScore: away?.score === undefined ? undefined : Number(away.score),
    venue: venue?.fullName,
    options,
    markets: buildMarkets(source.id, config.sport, homeAbbr, awayAbbr, odds, options),
    oddsProvider: odds?.provider?.name ?? (odds ? 'ESPN' : 'Demo odds'),
    isRealData: true,
    featured: config.key === 'eng.1' && index === 0,
  };
}

export function dateParam(date: string): string {
  return date.replace(/-/g, '');
}

export async function fetchSportsEvents(
  date?: string,
  signal?: AbortSignal,
): Promise<SportEvent[]> {
  const query = date ? `?dates=${dateParam(date)}` : '';
  const responses = await Promise.allSettled(
    leagues.map(async (config) => {
      const url = `${ESPN_BASE}/${config.path}/scoreboard${query}`;
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`ESPN ${config.key}: ${response.status}`);
      }
      const payload = (await response.json()) as EspnScoreboard;
      return (payload.events ?? [])
        .slice(0, 8)
        .map((event, index) => mapEvent(event, config, index, payload));
    }),
  );

  const events = responses.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  );
  if (events.length === 0) {
    throw new Error('No live fixtures returned');
  }

  const rank: Record<SportEvent['status'], number> = {
    live: 0,
    upcoming: 1,
    finished: 2,
  };

  return events.sort((left, right) => {
    if (rank[left.status] !== rank[right.status]) {
      return rank[left.status] - rank[right.status];
    }
    return left.kickoff.localeCompare(right.kickoff);
  });
}
