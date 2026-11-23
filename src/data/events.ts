import type { OddsMarket, SportEvent } from './types';

export const sports: (SportEvent['sport'] | 'All')[] = [
  'All',
  'Soccer',
  'Basketball',
  'American Football',
  'Ice Hockey',
  'Baseball',
  'Tennis',
];

function event(input: Omit<SportEvent, 'markets'>): SportEvent {
  const primary: OddsMarket = {
    id: `${input.id}-ml`,
    title: input.options.length === 3 ? 'Match result' : 'Moneyline',
    hint: input.sport === 'Soccer' ? 'Full time' : 'Game',
    options: input.options,
  };
  return {
    ...input,
    markets: [
      primary,
      {
        id: `${input.id}-totals`,
        title: input.sport === 'Soccer' ? 'Total goals' : 'Total',
        hint: 'Over / under',
        options: [
          { id: `${input.id}-over`, label: 'Over 2.5', odds: 1.92 },
          { id: `${input.id}-under`, label: 'Under 2.5', odds: 1.88 },
        ],
      },
    ],
  };
}

export const events: SportEvent[] = [
  event({
    id: 'demo-epl-everton-brentford',
    sport: 'Soccer',
    league: 'Premier League',
    leagueKey: 'eng.1',
    region: 'England',
    home: 'Brentford',
    away: 'Everton',
    homeAbbr: 'BRE',
    awayAbbr: 'EVE',
    kickoff: '20:00',
    dateLabel: 'Today',
    status: 'upcoming',
    statusDetail: 'Scheduled',
    venue: 'Gtech Community Stadium',
    options: [
      { id: 'demo-epl-home', label: '1', odds: 2.25 },
      { id: 'demo-epl-draw', label: 'X', odds: 3.5 },
      { id: 'demo-epl-away', label: '2', odds: 3.15 },
    ],
    oddsProvider: 'Demo',
    isRealData: false,
    featured: true,
  }),
  event({
    id: 'demo-nfl-bengals-commanders',
    sport: 'American Football',
    league: 'NFL',
    leagueKey: 'nfl',
    region: 'United States',
    home: 'Washington Commanders',
    away: 'Cincinnati Bengals',
    homeAbbr: 'WSH',
    awayAbbr: 'CIN',
    kickoff: '01:15',
    dateLabel: 'Tomorrow',
    status: 'upcoming',
    statusDetail: 'Scheduled',
    options: [
      { id: 'demo-nfl-home', label: 'WSH', odds: 3.41 },
      { id: 'demo-nfl-away', label: 'CIN', odds: 1.34 },
    ],
    oddsProvider: 'Demo',
    isRealData: false,
  }),
  event({
    id: 'demo-nba-pistons-hawks',
    sport: 'Basketball',
    league: 'NBA',
    leagueKey: 'nba',
    region: 'United States',
    home: 'Atlanta Hawks',
    away: 'Detroit Pistons',
    homeAbbr: 'ATL',
    awayAbbr: 'DET',
    kickoff: '20:30',
    dateLabel: 'Today',
    status: 'finished',
    statusDetail: 'Final',
    homeScore: 107,
    awayScore: 97,
    options: [
      { id: 'demo-nba-home', label: 'ATL', odds: 1.72 },
      { id: 'demo-nba-away', label: 'DET', odds: 2.11 },
    ],
    oddsProvider: 'Demo',
    isRealData: false,
  }),
  event({
    id: 'demo-nhl-rangers-hurricanes',
    sport: 'Ice Hockey',
    league: 'NHL',
    leagueKey: 'nhl',
    region: 'United States',
    home: 'New York Rangers',
    away: 'Carolina Hurricanes',
    homeAbbr: 'NYR',
    awayAbbr: 'CAR',
    kickoff: '17:30',
    dateLabel: 'Today',
    status: 'finished',
    statusDetail: 'Final',
    homeScore: 2,
    awayScore: 5,
    options: [
      { id: 'demo-nhl-home', label: 'NYR', odds: 2.04 },
      { id: 'demo-nhl-away', label: 'CAR', odds: 1.78 },
    ],
    oddsProvider: 'Demo',
    isRealData: false,
  }),
  event({
    id: 'demo-mlb-brewers-rays',
    sport: 'Baseball',
    league: 'MLB',
    leagueKey: 'mlb',
    region: 'United States',
    home: 'Tampa Bay Rays',
    away: 'Milwaukee Brewers',
    homeAbbr: 'TB',
    awayAbbr: 'MIL',
    kickoff: '00:00',
    dateLabel: 'Yesterday',
    status: 'finished',
    statusDetail: 'Final',
    homeScore: 1,
    awayScore: 4,
    options: [
      { id: 'demo-mlb-home', label: 'TB', odds: 1.91 },
      { id: 'demo-mlb-away', label: 'MIL', odds: 1.93 },
    ],
    oddsProvider: 'Demo',
    isRealData: false,
  }),
  event({
    id: 'demo-atp-finals',
    sport: 'Tennis',
    league: 'ATP Finals',
    leagueKey: 'atp',
    region: 'Italy',
    home: 'Carlos Alcaraz',
    away: 'Jannik Sinner',
    homeAbbr: 'ALC',
    awayAbbr: 'SIN',
    kickoff: '19:00',
    dateLabel: 'Today',
    status: 'upcoming',
    statusDetail: 'Scheduled',
    options: [
      { id: 'demo-atp-home', label: 'ALC', odds: 1.95 },
      { id: 'demo-atp-away', label: 'SIN', odds: 1.88 },
    ],
    oddsProvider: 'Demo',
    isRealData: false,
  }),
];

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function getEvent(id: string): SportEvent | undefined {
  return events.find((item) => item.id === id);
}

export function getFallbackEvent(id: string): SportEvent | undefined {
  return getEvent(id) ?? marketFallback(id);
}

function marketFallback(id: string): SportEvent | undefined {
  return event({
    id,
    sport: 'Soccer',
    league: 'Touchline',
    leagueKey: 'demo',
    region: 'Demo',
    home: 'Home team',
    away: 'Away team',
    homeAbbr: 'HOM',
    awayAbbr: 'AWY',
    kickoff: '--:--',
    dateLabel: 'Demo',
    status: 'upcoming',
    statusDetail: 'Demo event',
    options: [
      { id: `${id}-home`, label: '1', odds: 2.0 },
      { id: `${id}-draw`, label: 'X', odds: 3.3 },
      { id: `${id}-away`, label: '2', odds: 3.6 },
    ],
    oddsProvider: 'Demo',
    isRealData: false,
  });
}
