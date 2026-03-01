import { Coordinates, CalculationMethod as AdhanCalculationMethod, PrayerTimes, CalculationParameters } from 'adhan';
import { MosqueSettings, PrayerTimeData, PrayerName, CalculationMethod } from '../types';
import { PRAYER_LABELS } from '../constants';

export function getPrayerTimes(date: Date, settings: MosqueSettings): PrayerTimeData[] {
  const coords = new Coordinates(settings.latitude, settings.longitude);
  
  let params: CalculationParameters;
  
  // Map our enum to Adhan's methods
  switch (settings.calculationMethod) {
    case CalculationMethod.KEMENAG:
      params = AdhanCalculationMethod.MuslimWorldLeague();
      params.fajrAngle = 20;
      params.ishaAngle = 18;
      break;
    case CalculationMethod.UMM_AL_QURA:
      params = AdhanCalculationMethod.UmmAlQura();
      break;
    case CalculationMethod.MUSLIM_WORLD_LEAGUE:
      params = AdhanCalculationMethod.MuslimWorldLeague();
      break;
    case CalculationMethod.EGYPTIAN:
      params = AdhanCalculationMethod.Egyptian();
      break;
    case CalculationMethod.KARACHI:
      params = AdhanCalculationMethod.Karachi();
      break;
    case CalculationMethod.SINGAPORE:
      params = AdhanCalculationMethod.Singapore();
      break;
    case CalculationMethod.TURKEY:
      params = AdhanCalculationMethod.Turkey();
      break;
    case CalculationMethod.DUBAI:
      params = AdhanCalculationMethod.Dubai();
      break;
    case CalculationMethod.KUWAIT:
      params = AdhanCalculationMethod.Kuwait();
      break;
    case CalculationMethod.QATAR:
      params = AdhanCalculationMethod.Qatar();
      break;
    default:
      params = AdhanCalculationMethod.MuslimWorldLeague();
  }

  const prayerTimes = new PrayerTimes(coords, date, params);
  
  const names: PrayerName[] = ['imsak', 'fajr', 'sunrise', 'dhuha', 'dhuhr', 'asr', 'maghrib', 'isha'];
  
  const now = new Date();
  const result: PrayerTimeData[] = [];
  let nextFound = false;

  // Calculate extra times
  const imsakTime = new Date((prayerTimes.fajr?.getTime() || 0) - 10 * 60 * 1000);
  const dhuhaTime = new Date((prayerTimes.sunrise?.getTime() || 0) + 20 * 60 * 1000);

  const timesMap: Record<PrayerName, Date> = {
    imsak: imsakTime,
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuha: dhuhaTime,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  };

  for (const name of names) {
    const time = timesMap[name];
    let isNext = false;
    
    if (!nextFound && time && time > now) {
      isNext = true;
      nextFound = true;
    }

    result.push({
      name,
      label: PRAYER_LABELS[name],
      time: time || new Date(),
      isNext,
    });
  }

  if (!nextFound && result.length > 0) {
    result[0].isNext = true;
  }

  return result;
}

export async function getOnlinePrayerTimes(date: Date, settings: MosqueSettings): Promise<PrayerTimeData[]> {
  const timestamp = Math.floor(date.getTime() / 1000);
  const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=11`; // 11 is Kemenag RI

  try {
    const response = await fetch(url);
    const json = await response.json();
    
    if (json.code !== 200) throw new Error('API Error');

    const timings = json.data.timings;
    const names: PrayerName[] = ['imsak', 'fajr', 'sunrise', 'dhuha', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const now = new Date();
    const result: PrayerTimeData[] = [];
    let nextFound = false;

    // Helper to parse "HH:mm" to Date
    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      return d;
    };

    // Aladhan doesn't provide Dhuha directly, we calculate it
    const sunrise = parseTime(timings.Sunrise);
    const dhuha = new Date(sunrise.getTime() + 20 * 60 * 1000);

    const timesMap: Record<string, Date> = {
      imsak: parseTime(timings.Imsak),
      fajr: parseTime(timings.Fajr),
      sunrise: sunrise,
      dhuha: dhuha,
      dhuhr: parseTime(timings.Dhuhr),
      asr: parseTime(timings.Asr),
      maghrib: parseTime(timings.Maghrib),
      isha: parseTime(timings.Isha),
    };

    for (const name of names) {
      const time = timesMap[name];
      let isNext = false;
      
      if (!nextFound && time && time > now) {
        isNext = true;
        nextFound = true;
      }

      result.push({
        name,
        label: PRAYER_LABELS[name],
        time: time || new Date(),
        isNext,
      });
    }

    if (!nextFound && result.length > 0) {
      result[0].isNext = true;
    }

    return result;
  } catch (error) {
    console.error('Failed to fetch online prayer times, falling back to offline:', error);
    return getPrayerTimes(date, settings);
  }
}

export function formatHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return 'Hijri Date Unavailable';
  }
}
