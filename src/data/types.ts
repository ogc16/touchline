export type Sport =
  | 'Soccer'
  | 'Basketball'
  | 'American Football'
  | 'Ice Hockey'
  | 'Baseball'
  | 'Tennis';

export type EventStatus = 'live' | 'upcoming' | 'finished';

export interface OddsOption {
  id: string;
  label: string;
  odds: number;
}

export interface OddsMarket {
  id: string;
  title: string;
  hint: string;
  options: OddsOption[];
}

export interface SportEvent {
  id: string;
  sport: Sport;
  league: string;
  leagueKey: string;
  region: string;
  home: string;
  away: string;
  homeAbbr: string;
  awayAbbr: string;
  homeLogo?: string;
  awayLogo?: string;
  kickoff: string;
  dateLabel: string;
  status: EventStatus;
  minute?: string;
  statusDetail?: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  options: OddsOption[];
  markets: OddsMarket[];
  oddsProvider?: string;
  isRealData: boolean;
  featured?: boolean;
}

export interface Selection {
  id: string;
  eventId: string;
  eventLabel: string;
  marketLabel: string;
  odds: number;
  sport: Sport;
}

export interface PlacedBet {
  id: string;
  selections: Selection[];
  stake: number;
  payout: number;
  placedAt: string;
  status: 'pending' | 'won' | 'lost';
}
