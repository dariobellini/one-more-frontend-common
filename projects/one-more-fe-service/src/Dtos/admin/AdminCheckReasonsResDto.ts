import { AdminCheckReasonDto } from './AdminCheckReasonDto';

export interface AdminCheckReasonsResDto {
  outcome: boolean;
  description: string | null;
  reasons: AdminCheckReasonDto[] | null;
}
