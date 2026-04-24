'use client'

import { useMemo } from 'react'
import { Transaction } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#6366f1', '#ef4444',
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function IncomeChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const incomes = transactions.filter((t) => t.type === 'income')
    const grouped: Record<string, number> = {}
    for (const t of incomes) {
      grouped[t.category] = (grouped[t.category] ?? 0) + Number(t.amount)
    }
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Receitas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Nenhuma receita no periodo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value} />
              <Legend
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
