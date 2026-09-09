export type ServiceType = 'three-cards' | 'love' | 'full-scan';

export interface TarotCard {
  id: string;
  number: number;
  nameMn: string;
  nameEn: string;
  arcana: 'major' | 'minor';
  suitMn?: string;
  keywordsMn: string[];
  uprightMeaningMn: string;
  reversedMeaningMn: string;
  symbolMn: string;
  elementMn: string;
  planetaryMn: string;
  accentColor: string;
  descriptionMn: string;
  imageUrl?: string;
}

export interface TarotService {
  id: ServiceType;
  titleMn: string;
  subtitleMn: string;
  cardCount: number;
  priceMnt: number;
  originalPriceMnt: number;
  badgeMn: string;
  iconName: string;
  shortDescMn: string;
  fullDescMn: string;
  positionsMn: string[];
  featuresMn: string[];
  estimatedTimeMn: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  avatar: string;
  balanceMnt: number;
  createdAt: string;
  isGoogleAuth: boolean;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  positionNameMn: string;
}

export interface ReadingResult {
  id: string;
  timestamp: string;
  serviceId: ServiceType;
  serviceTitleMn: string;
  userQuestion: string;
  userName: string;
  userSignMn?: string;
  drawnCards: DrawnCard[];
  summaryMn: string;
  sectionsMn: {
    title: string;
    content: string;
    cardName?: string;
  }[];
  adviceMn: string;
  affirmationMn: string;
  overallEnergyMn?: string;
  keyChallengeMn?: string;
  keyBlessingMn?: string;
  luckyElementsMn?: {
    color: string;
    number: number;
    time: string;
  };
}

export interface ZodiacSign {
  id: string;
  nameMn: string;
  nameEn: string;
  symbol: string;
  datesMn: string;
  elementMn: string;
  planetMn: string;
  traitsMn: string[];
  luckyNumber: number;
  luckyColorMn: string;
  dailyFortuneMn: {
    general: string;
    love: string;
    career: string;
    loveScore: number;
    luckScore: number;
    advice: string;
  };
}
