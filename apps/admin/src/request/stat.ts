import { get } from './index';

export interface StatisticsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  data: {
    day: string;
    submitted: number;
    approved: number;
  }[];
}

export const getStatistics = () => {
  return get<StatisticsResponse>('/passage/admin/statistics');
};