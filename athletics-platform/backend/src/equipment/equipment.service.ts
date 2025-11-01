import { Injectable } from '@nestjs/common';

export interface EquipmentSpecs {
  hurdleHeight?: string;
  implementWeight?: string;
  implementSpecs?: {
    shotPut?: string;
    discus?: string;
    hammer?: string;
    javelin?: string;
    [key: string]: string | undefined;
  };
}

@Injectable()
export class EquipmentService {
  /**
   * Pobiera specyfikacje sprzętu dla danej kategorii wiekowej i dyscypliny
   */
  getEquipmentSpecs(
    category: string,
    discipline: string,
    gender: 'MALE' | 'FEMALE',
  ): EquipmentSpecs {
    const specs: EquipmentSpecs = {};

    // Wysokości płotków
    if (discipline.includes('HURDLES') || discipline.includes('PŁOTKI')) {
      specs.hurdleHeight = this.getHurdleHeight(category, gender, discipline);
    }

    // Wagi przyrządów
    if (discipline.includes('SHOT') || discipline.includes('KULA')) {
      specs.implementWeight = this.getShotPutWeight(category, gender);
    }

    if (discipline.includes('DISCUS') || discipline.includes('DYSK')) {
      specs.implementWeight = this.getDiscusWeight(category, gender);
    }

    if (discipline.includes('HAMMER') || discipline.includes('MŁOT')) {
      specs.implementWeight = this.getHammerWeight(category, gender);
    }

    if (discipline.includes('JAVELIN') || discipline.includes('OSZCZEP')) {
      specs.implementWeight = this.getJavelinWeight(category, gender);
    }

    // Dodatkowe specyfikacje dla wielobojów
    if (
      discipline.includes('DECATHLON') ||
      discipline.includes('HEPTATHLON') ||
      discipline.includes('PENTATHLON')
    ) {
      specs.implementSpecs = this.getCombinedEventSpecs(category, gender);
    }

    return specs;
  }

  /**
   * Wysokości płotków według kategorii wiekowych (zgodnie z przepisami PZLA 2023)
   */
  private getHurdleHeight(
    category: string,
    gender: 'MALE' | 'FEMALE',
    discipline: string,
  ): string {
    const is110m = discipline.includes('110') || discipline.includes('100');
    const is400m = discipline.includes('400');
    const is80m = discipline.includes('80');
    const is60m = discipline.includes('60');

    // Płotki 110m mężczyźni / 100m kobiety
    if (is110m) {
      if (gender === 'MALE') {
        switch (category) {
          // Kategorie dziecięce
          case 'AGE_5':
          case 'AGE_6':
          case 'AGE_7':
          case 'AGE_8':
            return '0.50m';
          case 'AGE_9':
          case 'AGE_10':
            return '0.60m';
          case 'AGE_11':
          case 'AGE_12':
            return '0.68m';
          case 'AGE_13':
            return '0.76m';
          case 'AGE_14':
            return '0.84m';
          case 'AGE_15':
            return '0.91m';
          case 'AGE_16':
            return '0.91m';
          case 'AGE_17':
          case 'AGE_18':
            return '0.99m';
          // Kategorie U
          case 'U8':
          case 'U9':
          case 'U10':
            return '0.60m';
          case 'U11':
          case 'U12':
            return '0.68m';
          case 'U13':
            return '0.76m';
          case 'U14':
            return '0.84m';
          case 'U15':
            return '0.91m';
          case 'U16':
            return '0.91m';
          case 'U18':
            return '0.99m';
          case 'U20':
          case 'U23':
          case 'SENIOR':
            return '1.067m';
          // Masters
          case 'M35':
          case 'M40':
          case 'M45':
          case 'M50':
            return '1.067m';
          case 'M55':
          case 'M60':
            return '0.99m';
          case 'M65':
          case 'M70':
            return '0.91m';
          case 'M75':
          case 'M80':
            return '0.84m';
          case 'M85':
          case 'M90':
            return '0.76m';
          case 'M95':
          case 'M100':
            return '0.68m';
          default:
            return '1.067m';
        }
      } else {
        switch (category) {
          // Kategorie dziecięce
          case 'AGE_5':
          case 'AGE_6':
          case 'AGE_7':
          case 'AGE_8':
            return '0.50m';
          case 'AGE_9':
          case 'AGE_10':
            return '0.60m';
          case 'AGE_11':
          case 'AGE_12':
            return '0.68m';
          case 'AGE_13':
            return '0.76m';
          case 'AGE_14':
            return '0.76m';
          case 'AGE_15':
            return '0.84m';
          case 'AGE_16':
            return '0.84m';
          case 'AGE_17':
          case 'AGE_18':
            return '0.84m';
          // Kategorie U
          case 'U8':
          case 'U9':
          case 'U10':
            return '0.60m';
          case 'U11':
          case 'U12':
            return '0.68m';
          case 'U13':
            return '0.76m';
          case 'U14':
            return '0.76m';
          case 'U15':
            return '0.84m';
          case 'U16':
            return '0.84m';
          case 'U18':
            return '0.84m';
          case 'U20':
          case 'U23':
          case 'SENIOR':
            return '0.84m';
          // Masters
          case 'M35':
          case 'M40':
          case 'M45':
          case 'M50':
            return '0.84m';
          case 'M55':
          case 'M60':
            return '0.76m';
          case 'M65':
          case 'M70':
            return '0.68m';
          case 'M75':
          case 'M80':
            return '0.60m';
          case 'M85':
          case 'M90':
            return '0.50m';
          default:
            return '0.84m';
        }
      }
    }

    // Płotki 400m
    if (is400m) {
      if (gender === 'MALE') {
        switch (category) {
          case 'AGE_14':
          case 'U14':
            return '0.84m';
          case 'AGE_15':
          case 'AGE_16':
          case 'U15':
          case 'U16':
            return '0.84m';
          case 'AGE_17':
          case 'AGE_18':
          case 'U18':
            return '0.91m';
          case 'U20':
          case 'U23':
          case 'SENIOR':
            return '0.91m';
          case 'M35':
          case 'M40':
          case 'M45':
          case 'M50':
            return '0.91m';
          case 'M55':
          case 'M60':
            return '0.84m';
          case 'M65':
          case 'M70':
            return '0.76m';
          case 'M75':
          case 'M80':
            return '0.68m';
          default:
            return '0.91m';
        }
      } else {
        switch (category) {
          case 'AGE_14':
          case 'U14':
            return '0.76m';
          case 'AGE_15':
          case 'AGE_16':
          case 'U15':
          case 'U16':
            return '0.76m';
          case 'AGE_17':
          case 'AGE_18':
          case 'U18':
            return '0.76m';
          case 'U20':
          case 'U23':
          case 'SENIOR':
            return '0.76m';
          case 'M35':
          case 'M40':
          case 'M45':
          case 'M50':
            return '0.76m';
          case 'M55':
          case 'M60':
            return '0.68m';
          case 'M65':
          case 'M70':
            return '0.60m';
          case 'M75':
          case 'M80':
            return '0.50m';
          default:
            return '0.76m';
        }
      }
    }

    // Płotki 80m (młodzież)
    if (is80m) {
      if (gender === 'MALE') {
        switch (category) {
          case 'AGE_12':
          case 'AGE_13':
          case 'U12':
          case 'U13':
            return '0.84m';
          default:
            return '0.84m';
        }
      } else {
        switch (category) {
          case 'AGE_12':
          case 'AGE_13':
          case 'U12':
          case 'U13':
            return '0.76m';
          default:
            return '0.76m';
        }
      }
    }

    // Płotki 60m (hala)
    if (is60m) {
      if (gender === 'MALE') {
        switch (category) {
          case 'U18':
            return '0.99m';
          case 'U20':
          case 'U23':
          case 'SENIOR':
            return '1.067m';
          case 'M35':
          case 'M40':
          case 'M45':
          case 'M50':
            return '1.067m';
          case 'M55':
          case 'M60':
            return '0.99m';
          case 'M65':
          case 'M70':
            return '0.91m';
          case 'M75':
          case 'M80':
            return '0.84m';
          default:
            return '1.067m';
        }
      } else {
        switch (category) {
          case 'U18':
          case 'U20':
          case 'U23':
          case 'SENIOR':
            return '0.84m';
          case 'M35':
          case 'M40':
          case 'M45':
          case 'M50':
            return '0.84m';
          case 'M55':
          case 'M60':
            return '0.76m';
          case 'M65':
          case 'M70':
            return '0.68m';
          default:
            return '0.84m';
        }
      }
    }

    return '0.84m'; // domyślna wysokość
  }

  /**
   * Wagi kuli według kategorii wiekowych (zgodnie z przepisami PZLA 2023)
   */
  private getShotPutWeight(
    category: string,
    gender: 'MALE' | 'FEMALE',
  ): string {
    if (gender === 'MALE') {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_5':
        case 'AGE_6':
        case 'AGE_7':
        case 'AGE_8':
          return '1kg';
        case 'AGE_9':
        case 'AGE_10':
          return '2kg';
        case 'AGE_11':
        case 'AGE_12':
          return '3kg';
        case 'AGE_13':
          return '3kg';
        case 'AGE_14':
          return '4kg';
        case 'AGE_15':
          return '4kg';
        case 'AGE_16':
          return '5kg';
        case 'AGE_17':
        case 'AGE_18':
          return '6kg';
        // Kategorie U
        case 'U8':
        case 'U9':
        case 'U10':
          return '2kg';
        case 'U11':
        case 'U12':
          return '3kg';
        case 'U13':
          return '3kg';
        case 'U14':
          return '4kg';
        case 'U15':
          return '4kg';
        case 'U16':
          return '5kg';
        case 'U18':
          return '6kg';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '7.26kg';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '7.26kg';
        case 'M55':
        case 'M60':
          return '6kg';
        case 'M65':
        case 'M70':
          return '5kg';
        case 'M75':
        case 'M80':
          return '4kg';
        case 'M85':
        case 'M90':
          return '3kg';
        case 'M95':
        case 'M100':
          return '3kg';
        default:
          return '7.26kg';
      }
    } else {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_5':
        case 'AGE_6':
        case 'AGE_7':
        case 'AGE_8':
          return '1kg';
        case 'AGE_9':
        case 'AGE_10':
          return '2kg';
        case 'AGE_11':
        case 'AGE_12':
          return '2kg';
        case 'AGE_13':
          return '3kg';
        case 'AGE_14':
          return '3kg';
        case 'AGE_15':
          return '3kg';
        case 'AGE_16':
          return '3kg';
        case 'AGE_17':
        case 'AGE_18':
          return '4kg';
        // Kategorie U
        case 'U8':
        case 'U9':
        case 'U10':
          return '2kg';
        case 'U11':
        case 'U12':
          return '2kg';
        case 'U13':
          return '3kg';
        case 'U14':
          return '3kg';
        case 'U15':
          return '3kg';
        case 'U16':
          return '3kg';
        case 'U18':
          return '4kg';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '4kg';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '4kg';
        case 'M55':
        case 'M60':
          return '3kg';
        case 'M65':
        case 'M70':
          return '3kg';
        case 'M75':
        case 'M80':
          return '2kg';
        case 'M85':
        case 'M90':
          return '2kg';
        default:
          return '4kg';
      }
    }
  }

  /**
   * Wagi dysku według kategorii wiekowych (zgodnie z przepisami PZLA 2023)
   */
  private getDiscusWeight(category: string, gender: 'MALE' | 'FEMALE'): string {
    if (gender === 'MALE') {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_5':
        case 'AGE_6':
        case 'AGE_7':
        case 'AGE_8':
          return '0.5kg';
        case 'AGE_9':
        case 'AGE_10':
          return '0.5kg';
        case 'AGE_11':
        case 'AGE_12':
          return '0.75kg';
        case 'AGE_13':
          return '1kg';
        case 'AGE_14':
          return '1kg';
        case 'AGE_15':
          return '1.5kg';
        case 'AGE_16':
          return '1.5kg';
        case 'AGE_17':
        case 'AGE_18':
          return '1.75kg';
        // Kategorie U
        case 'U8':
        case 'U9':
        case 'U10':
          return '0.5kg';
        case 'U11':
        case 'U12':
          return '0.75kg';
        case 'U13':
          return '1kg';
        case 'U14':
          return '1kg';
        case 'U15':
          return '1.5kg';
        case 'U16':
          return '1.5kg';
        case 'U18':
          return '1.75kg';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '2kg';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '2kg';
        case 'M55':
        case 'M60':
          return '1.5kg';
        case 'M65':
        case 'M70':
          return '1kg';
        case 'M75':
        case 'M80':
          return '1kg';
        case 'M85':
        case 'M90':
          return '1kg';
        default:
          return '2kg';
      }
    } else {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_5':
        case 'AGE_6':
        case 'AGE_7':
        case 'AGE_8':
          return '0.5kg';
        case 'AGE_9':
        case 'AGE_10':
          return '0.5kg';
        case 'AGE_11':
        case 'AGE_12':
          return '0.6kg';
        case 'AGE_13':
          return '0.75kg';
        case 'AGE_14':
          return '1kg';
        case 'AGE_15':
          return '1kg';
        case 'AGE_16':
          return '1kg';
        case 'AGE_17':
        case 'AGE_18':
          return '1kg';
        // Kategorie U
        case 'U8':
        case 'U9':
        case 'U10':
          return '0.5kg';
        case 'U11':
        case 'U12':
          return '0.6kg';
        case 'U13':
          return '0.75kg';
        case 'U14':
          return '1kg';
        case 'U15':
          return '1kg';
        case 'U16':
          return '1kg';
        case 'U18':
          return '1kg';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '1kg';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '1kg';
        case 'M55':
        case 'M60':
          return '1kg';
        case 'M65':
        case 'M70':
          return '0.75kg';
        case 'M75':
        case 'M80':
          return '0.75kg';
        case 'M85':
        case 'M90':
          return '0.75kg';
        default:
          return '1kg';
      }
    }
  }

  /**
   * Wagi młota według kategorii wiekowych (zgodnie z przepisami PZLA 2023)
   */
  private getHammerWeight(category: string, gender: 'MALE' | 'FEMALE'): string {
    if (gender === 'MALE') {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_13':
          return '3kg';
        case 'AGE_14':
          return '4kg';
        case 'AGE_15':
          return '4kg';
        case 'AGE_16':
          return '5kg';
        case 'AGE_17':
        case 'AGE_18':
          return '6kg';
        // Kategorie U
        case 'U13':
          return '3kg';
        case 'U14':
          return '4kg';
        case 'U15':
          return '4kg';
        case 'U16':
          return '5kg';
        case 'U18':
          return '6kg';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '7.26kg';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '7.26kg';
        case 'M55':
        case 'M60':
          return '6kg';
        case 'M65':
        case 'M70':
          return '5kg';
        case 'M75':
        case 'M80':
          return '4kg';
        case 'M85':
        case 'M90':
          return '4kg';
        default:
          return '7.26kg';
      }
    } else {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_13':
          return '2kg';
        case 'AGE_14':
          return '3kg';
        case 'AGE_15':
          return '3kg';
        case 'AGE_16':
          return '3kg';
        case 'AGE_17':
        case 'AGE_18':
          return '4kg';
        // Kategorie U
        case 'U13':
          return '2kg';
        case 'U14':
          return '3kg';
        case 'U15':
          return '3kg';
        case 'U16':
          return '3kg';
        case 'U18':
          return '4kg';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '4kg';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '4kg';
        case 'M55':
        case 'M60':
          return '3kg';
        case 'M65':
        case 'M70':
          return '3kg';
        case 'M75':
        case 'M80':
          return '2kg';
        case 'M85':
        case 'M90':
          return '2kg';
        default:
          return '4kg';
      }
    }
  }

  /**
   * Wagi oszczepów według kategorii wiekowych (zgodnie z przepisami PZLA 2023)
   */
  private getJavelinWeight(
    category: string,
    gender: 'MALE' | 'FEMALE',
  ): string {
    if (gender === 'MALE') {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_5':
        case 'AGE_6':
        case 'AGE_7':
        case 'AGE_8':
          return '300g';
        case 'AGE_9':
        case 'AGE_10':
          return '300g';
        case 'AGE_11':
        case 'AGE_12':
          return '400g';
        case 'AGE_13':
          return '400g';
        case 'AGE_14':
          return '500g';
        case 'AGE_15':
          return '600g';
        case 'AGE_16':
          return '700g';
        case 'AGE_17':
        case 'AGE_18':
          return '800g';
        // Kategorie U
        case 'U8':
        case 'U9':
        case 'U10':
          return '300g';
        case 'U11':
        case 'U12':
          return '400g';
        case 'U13':
          return '400g';
        case 'U14':
          return '500g';
        case 'U15':
          return '600g';
        case 'U16':
          return '700g';
        case 'U18':
          return '800g';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '800g';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '800g';
        case 'M55':
        case 'M60':
          return '700g';
        case 'M65':
        case 'M70':
          return '600g';
        case 'M75':
        case 'M80':
          return '500g';
        case 'M85':
        case 'M90':
          return '500g';
        default:
          return '800g';
      }
    } else {
      switch (category) {
        // Kategorie dziecięce
        case 'AGE_5':
        case 'AGE_6':
        case 'AGE_7':
        case 'AGE_8':
          return '300g';
        case 'AGE_9':
        case 'AGE_10':
          return '300g';
        case 'AGE_11':
        case 'AGE_12':
          return '400g';
        case 'AGE_13':
          return '400g';
        case 'AGE_14':
          return '500g';
        case 'AGE_15':
          return '500g';
        case 'AGE_16':
          return '500g';
        case 'AGE_17':
        case 'AGE_18':
          return '600g';
        // Kategorie U
        case 'U8':
        case 'U9':
        case 'U10':
          return '300g';
        case 'U11':
        case 'U12':
          return '400g';
        case 'U13':
          return '400g';
        case 'U14':
          return '500g';
        case 'U15':
          return '500g';
        case 'U16':
          return '500g';
        case 'U18':
          return '600g';
        case 'U20':
        case 'U23':
        case 'SENIOR':
          return '600g';
        // Masters
        case 'M35':
        case 'M40':
        case 'M45':
        case 'M50':
          return '600g';
        case 'M55':
        case 'M60':
          return '500g';
        case 'M65':
        case 'M70':
          return '500g';
        case 'M75':
        case 'M80':
          return '400g';
        case 'M85':
        case 'M90':
          return '400g';
        default:
          return '600g';
      }
    }
  }

  /**
   * Specyfikacje sprzętu dla wielobojów
   */
  private getCombinedEventSpecs(
    category: string,
    gender: 'MALE' | 'FEMALE',
  ): any {
    return {
      shotPut: this.getShotPutWeight(category, gender),
      discus: this.getDiscusWeight(category, gender),
      hammer: this.getHammerWeight(category, gender),
      javelin: this.getJavelinWeight(category, gender),
      hurdleHeight110: this.getHurdleHeight(category, gender, '110M_HURDLES'),
      hurdleHeight400: this.getHurdleHeight(category, gender, '400M_HURDLES'),
    };
  }

  /**
   * Pobiera wszystkie dostępne kategorie wiekowe
   */
  getAllCategories(): string[] {
    return [
      'WIELE',
      'AGE_0_11',
      'AGE_5',
      'AGE_6',
      'AGE_7',
      'AGE_8',
      'AGE_9',
      'AGE_10',
      'AGE_11',
      'AGE_12',
      'AGE_13',
      'AGE_14',
      'AGE_15',
      'AGE_16',
      'AGE_17',
      'AGE_18',
      'AGE_19',
      'AGE_20',
      'AGE_21',
      'AGE_22',
      'CLASS_1_SZKOLA_SREDNIA',
      'CLASS_2_SZKOLA_SREDNIA',
      'CLASS_3_SZKOLA_SREDNIA',
      'CLASS_4_SZKOLA_SREDNIA',
      'CLASS_5_SZKOLA_SREDNIA',
      'CLASS_6_SZKOLA_SREDNIA',
      'CLASS_7',
      'CLASS_8',
      'U8',
      'U9',
      'U10',
      'U11',
      'U12',
      'U13',
      'U14',
      'U15',
      'U16',
      'U18',
      'U20',
      'U23',
      'SENIOR',
      'M35',
      'M40',
      'M45',
      'M50',
      'M55',
      'M60',
      'M65',
      'M70',
      'M75',
      'M80',
      'M85',
      'M90',
      'M95',
      'M100',
      'M105',
      'M110',
    ];
  }

  /**
   * Pobiera opis kategorii wiekowej
   */
  getCategoryDescription(category: string): string {
    const descriptions = {
      WIELE: 'Wiele kategorii',
      AGE_0_11: '0-11 lat',
      AGE_5: '5 lat',
      AGE_6: '6 lat',
      AGE_7: '7 lat',
      AGE_8: '8 lat',
      AGE_9: '9 lat',
      AGE_10: '10 lat',
      AGE_11: '11 lat',
      AGE_12: '12 lat',
      AGE_13: '13 lat',
      AGE_14: '14 lat',
      AGE_15: '15 lat',
      AGE_16: '16 lat',
      AGE_17: '17 lat',
      AGE_18: '18 lat',
      AGE_19: '19 lat',
      AGE_20: '20 lat',
      AGE_21: '21 lat',
      AGE_22: '22 lat',
      CLASS_1_SZKOLA_SREDNIA: '1. Klasa szkoły średniej',
      CLASS_2_SZKOLA_SREDNIA: '2. Klasa szkoły średniej',
      CLASS_3_SZKOLA_SREDNIA: '3. Klasa szkoły średniej',
      CLASS_4_SZKOLA_SREDNIA: '4. Klasa szkoły średniej',
      CLASS_5_SZKOLA_SREDNIA: '5. Klasa szkoły średniej',
      CLASS_6_SZKOLA_SREDNIA: '6. Klasa szkoły średniej',
      CLASS_7: '7. Klasa',
      CLASS_8: '8. Klasa',
      U8: 'Do lat 8',
      U9: 'Do lat 9',
      U10: 'Do lat 10',
      U11: 'Do lat 11',
      U12: 'Do lat 12',
      U13: 'Do lat 13',
      U14: 'Do lat 14',
      U15: 'Do lat 15',
      U16: 'Do lat 16',
      U18: 'Do lat 18',
      U20: 'Do lat 20',
      U23: 'Do lat 23',
      SENIOR: 'Seniorzy (20+)',
      M35: 'Masters 35+',
      M40: 'Masters 40+',
      M45: 'Masters 45+',
      M50: 'Masters 50+',
      M55: 'Masters 55+',
      M60: 'Masters 60+',
      M65: 'Masters 65+',
      M70: 'Masters 70+',
      M75: 'Masters 75+',
      M80: 'Masters 80+',
      M85: 'Masters 85+',
      M90: 'Masters 90+',
      M95: 'Masters 95+',
      M100: 'Masters 100+',
      M105: 'Masters 105+',
      M110: 'Masters 110+',
    };

    return descriptions[category] || category;
  }
}
