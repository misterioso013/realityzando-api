export type ParticipantStatus =
  | 'lider'
  | 'paredao'
  | 'imune'
  | 'anjo'
  | 'na-mira'
  | 'monstro'
  | 'vip'
  | 'xepa';

export interface ParticipantStatusHistory {
  lider: number;
  paredao: number;
  imune: number;
  anjo: number;
  'na-mira': number;
  monstro: number;
  vip: number;
  xepa: number;
}

export interface Participant {
  name: string;
  image: string;
  link: string;
  wasEliminated: boolean;
  profession?: string;
  age?: string;
  location?: string;
  partner?: {
    name: string;
    image: string;
    link: string;
  };
  season: number;
  isWinner?: boolean;
  currentStatus: ParticipantStatus[];
  statusHistory: ParticipantStatusHistory;
}

export interface ParticipantsData {
  bbb25: {
    participants: Participant[];
    lastUpdate: string;
  };
}