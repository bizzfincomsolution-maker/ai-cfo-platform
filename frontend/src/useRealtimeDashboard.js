import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useRealtimeDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAllTransactions = async () => {
    let allTransactions = []
    let page = 0
    const pageSize = 1000

    while (true) {
      const { data: batch, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        console.error('Error fetching transactions:', error)
        break
      }

      if (!batch || batch.length === 0) break

      allTransactions = [...allTransactions, ...batch]

      if (batch.length < pageSize) break

      page++
    }

    return allTransactions
  }

  const fetchData = async () => {
    const txns = await fetchAllTransactions()

    if (!txns || txns.length === 0) return

    // Calculate KPI values
    const income  = txns.filter(t => t.type === 'income')
    const expense = txns.filter(t => t.type === 'expense')

    const totalRevenue  = income.reduce((s, t) => s + t.amount, 0)
    const totalExpenses = expense.reduce((s, t) => s + t.amount, 0)
    const cashFlow      = totalRevenue - totalExpenses
    const profitMargin  = totalRevenue > 0
      ? ((cashFlow / totalRevenue) * 100).toFixed(1)
      : 0

    // Monthly data for charts
    const monthlyMap = {}
    txns.forEach(t => {
      const month = t.date.substring(0, 7)
      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, revenue: 0, expenses: 0 }
      }
      if (t.type === 'income')  monthlyMap[month].revenue  += t.amount
      if (t.type === 'expense') monthlyMap[month].expenses += t.amount
    })

    const monthlyData = Object.values(monthlyMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(m => ({
        ...m,
        cashFlow: m.revenue - m.expenses,
        profitMargin: m.revenue > 0
          ? ((m.revenue - m.expenses) / m.revenue * 100).toFixed(1)
          : 0
      }))

    // Category breakdown for pie chart
    const categoryMap = {}
    expense.forEach(t => {
      const cat = t.category || 'Other'
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount
    })
    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)

    setData({
      totalRevenue,
      totalExpenses,
      cashFlow,
      profitMargin,
      transactions: txns,
      monthlyData,
      categoryData,
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()

    const subscription = supabase
      .channel('transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => {
        console.log('Real-time update received!')
        fetchData()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  return { data, loading }
}