'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction, TransactionFormData, CATEGORIES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: (transaction: Transaction) => void
  transaction: Transaction | null
}

const DEFAULT_FORM: TransactionFormData = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

export function TransactionDialog({ open, onClose, onSaved, transaction }: Props) {
  const [form, setForm] = useState<TransactionFormData>(DEFAULT_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type,
        amount: String(transaction.amount),
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setError(null)
  }, [transaction, open])

  const categories = CATEGORIES[form.type]

  function setField<K extends keyof TransactionFormData>(key: K, value: TransactionFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'type') next.category = ''
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount.replace(/\./g, '').replace(',', '.'))
    if (isNaN(amount) || amount <= 0) {
      setError('Informe um valor valido maior que zero.')
      return
    }
    if (!form.category) {
      setError('Selecione uma categoria.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const payload = {
      user_id: user.id,
      type: form.type,
      amount,
      category: form.category,
      description: form.description,
      date: form.date,
    }

    if (transaction) {
      const { data, error } = await supabase
        .from('transactions')
        .update(payload)
        .eq('id', transaction.id)
        .select()
        .single()

      if (error) { setError('Erro ao atualizar transacao.'); setLoading(false); return }
      onSaved(data as Transaction)
    } else {
      const { data, error } = await supabase
        .from('transactions')
        .insert(payload)
        .select()
        .single()

      if (error) { setError('Erro ao salvar transacao.'); setLoading(false); return }
      onSaved(data as Transaction)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar Transacao' : 'Nova Transacao'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => v && setField('type', v as 'income' | 'expense')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Valor (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00 ou 1.000,00"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Categoria</Label>
            <Select value={form.category} onValueChange={(v) => v && setField('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Descricao</Label>
            <Input
              type="text"
              placeholder="Ex: Supermercado"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label>Data</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setField('date', e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : transaction ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
