'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { Transaction } from '@/lib/types'
import { SummaryCards } from './summary-cards'
import { ExpenseChart } from './expense-chart'
import { IncomeChart } from './income-chart'
import { TransactionsTable } from './transactions-table'
import { TransactionDialog } from '../transactions/transaction-dialog'
import { TransactionFilters } from '../transactions/transaction-filters'
import { Button } from '@/components/ui/button'
import { Plus, LogOut, TrendingUp, Sun, Moon } from 'lucide-react'

interface DashboardClientProps {
  initialTransactions: Transaction[]
  userEmail: string
  userName: string
}

export function DashboardClient({ initialTransactions, userEmail, userName }: DashboardClientProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMonth = filterMonth ? t.date.startsWith(filterMonth) : true
      const matchCategory = filterCategory === 'all' || t.category === filterCategory
      const matchType = filterType === 'all' || t.type === filterType
      return matchMonth && matchCategory && matchType
    })
  }, [transactions, filterMonth, filterCategory, filterType])

  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  }, [filteredTransactions])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  function handleSaved(transaction: Transaction) {
    if (editingTransaction) {
      setTransactions((prev) => prev.map((t) => (t.id === transaction.id ? transaction : t)))
    } else {
      setTransactions((prev) => [transaction, ...prev])
    }
    setEditingTransaction(null)
    setDialogOpen(false)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setEditingTransaction(null)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Rotina Financeira do {userName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary Cards */}
        <SummaryCards summary={summary} />

        {/* Charts + Actions row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ExpenseChart transactions={filteredTransactions} />
            <IncomeChart transactions={filteredTransactions} />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => { setEditingTransaction(null); setDialogOpen(true) }}
              className="w-full h-12 text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Transacao
            </Button>
            <TransactionFilters
              filterMonth={filterMonth}
              filterCategory={filterCategory}
              filterType={filterType}
              onMonthChange={setFilterMonth}
              onCategoryChange={setFilterCategory}
              onTypeChange={setFilterType}
            />
          </div>
        </div>

        {/* Transactions Table */}
        <TransactionsTable
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <TransactionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSaved={handleSaved}
        transaction={editingTransaction}
      />
    </div>
  )
}
