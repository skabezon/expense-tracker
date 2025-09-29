export interface Transaction {
  id: string | number;
  date: string;
  description: string;
  category: string;
  amount: number;
  method: string;
  unnecessary: boolean;
}