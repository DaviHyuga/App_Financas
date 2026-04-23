export type TransactionType = 'income' | 'expense'

export const CATEGORIES = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  expense: [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Roupas',
    'Outros',
  ],
} as const

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string
  created_at: string
  updated_at: string
}

export interface TransactionFormData {
  type: TransactionType
  amount: string
  category: string
  description: string
  date: string
}

export interface DashboardSummary {
  totalIncome: number
  totalExpense: number
  balance: number
}
