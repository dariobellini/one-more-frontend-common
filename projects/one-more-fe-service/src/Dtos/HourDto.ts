import { DayOfWeek } from "../Enum/DayOfWeek";
import { PeriodOfDay } from "../Enum/PeriodOfDay";

export interface HourDto {
    dayOfWeek: DayOfWeek; // DayOfWeek in .NET è un enum, in TS possiamo usare number o creare un enum equivalente
    period: PeriodOfDay;
    startTime: string; // TimeSpan in .NET → string in formato "HH:mm:ss"
    endTime: string;
}