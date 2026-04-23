'use client'

import { CATEGORIES } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ALL_CATEGORIES = [...CATEGORIES.income, ...CATEGORIES.expense].filter(
  (v, i, a) => a.indexOf(v) === i
)

interface Props {
  filterMonth: string
  filterCategory: string
  filterType: string
  onMonthChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onTypeChange: (v: string) => void
}

export function TransactionFilters({
  filterMonth,
  filterCategory,
  filterType,
  onMonthChange,
  onCategoryChange,
  onTypeChange,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Mes</Label>
          <Input
            type="month"
            value={filterMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select value={filterType} onValueChange={(v) => onTypeChange(v ?? 'all')}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <Select value={filterCategory} onValueChange={(v) => onCategoryChange(v ?? 'all')}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {ALL_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
