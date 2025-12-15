type ChatMessage = {
  _id?: string;
  id: string;
  userId: string;
  inputText: string;
  parsedData: ParsedData | null;
  isFavorite?: boolean;
  createdAt: string;
};

type ParsedData = {
  text: string;
  amount: number;
  category: string;
  transaction_type: 'EXPENSE' | 'INCOME' | 'INVESTMENTS' | 'SAVINGS';
  tags: string[];
  sentiment?: number;
  location?: string;
  timestamp: string;
  year: number;
  month: number;
  year_month: string;
  month_name: string;
  year_month_key: string;
};
