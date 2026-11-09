import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Category =
  | 'Comida'
  | 'Transporte'
  | 'Servicios'
  | 'Ocio'
  | 'Otros'

interface Expense {
  id: string
  concept: string
  amount: number
  category: Category
  createdAt: string
}

const STORAGE_KEY = 'mi-billetera-lite-expenses-v1'
const categories: Category[] = [
  'Comida',
  'Transporte',
  'Servicios',
  'Ocio',
  'Otros',
]
const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})
const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') {
    return false
  }

  const expense = value as Partial<Expense>
  return (
    typeof expense.id === 'string' &&
    typeof expense.concept === 'string' &&
    expense.concept.trim().length > 0 &&
    typeof expense.amount === 'number' &&
    Number.isFinite(expense.amount) &&
    expense.amount > 0 &&
    typeof expense.category === 'string' &&
    categories.includes(expense.category as Category) &&
    typeof expense.createdAt === 'string' &&
    !Number.isNaN(Date.parse(expense.createdAt))
  )
}

function loadExpenses(): Expense[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed) || !parsed.every(isExpense)) {
      console.error('Los gastos guardados tienen un formato inválido.')
      return []
    }

    return parsed
  } catch (error: unknown) {
    console.error('No se pudieron cargar los gastos guardados.', error)
    return []
  }
}

function createExpenseId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses)
  const [concept, setConcept] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('Otros')
  const [validationMessage, setValidationMessage] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
    } catch (error: unknown) {
      console.error('No se pudieron guardar los gastos.', error)
    }
  }, [expenses])

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedConcept = concept.trim()
    const numericAmount = Number(amount)

    if (!trimmedConcept) {
      setValidationMessage('Escribe un concepto para el gasto.')
      return
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setValidationMessage('El monto debe ser un número mayor que cero.')
      return
    }

    const newExpense: Expense = {
      id: createExpenseId(),
      concept: trimmedConcept,
      amount: numericAmount,
      category,
      createdAt: new Date().toISOString(),
    }

    setExpenses((currentExpenses) => [newExpense, ...currentExpenses])
    setConcept('')
    setAmount('')
    setCategory('Otros')
    setValidationMessage('')
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Gastos diarios</p>
          <h1>Mi Billetera Lite</h1>
          <p className="intro">
            Registra tus gastos rápidamente y conserva tu historial en este
            dispositivo.
          </p>
        </div>
        <section className="total-card" aria-labelledby="total-title">
          <span id="total-title" className="total-label">
            Total registrado
          </span>
          <strong>{currencyFormatter.format(total)}</strong>
          <span className="total-count">
            {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
          </span>
        </section>
      </header>

      <div className="content-grid">
        <section className="panel" aria-labelledby="new-expense-title">
          <div className="section-heading">
            <p className="eyebrow">Nuevo movimiento</p>
            <h2 id="new-expense-title">Registrar gasto</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="concept">Concepto</label>
            <input
              id="concept"
              name="concept"
              type="text"
              placeholder="Ej. Café"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              autoComplete="off"
              required
            />

            <label htmlFor="amount">Monto</label>
            <div className="amount-input">
              <span aria-hidden="true">$</span>
              <input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>

            <label htmlFor="category">Categoría</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {validationMessage && (
              <p className="form-message" role="alert">
                {validationMessage}
              </p>
            )}

            <button type="submit">Guardar gasto</button>
          </form>
        </section>

        <section className="panel history-panel" aria-labelledby="history-title">
          <div className="section-heading history-heading">
            <div>
              <p className="eyebrow">Actividad reciente</p>
              <h2 id="history-title">Historial de gastos</h2>
            </div>
            <span className="offline-badge">Disponible offline</span>
          </div>

          {expenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                +
              </span>
              <p>Aún no tienes gastos registrados.</p>
              <span>Agrega tu primer movimiento desde el formulario.</span>
            </div>
          ) : (
            <ul className="expense-list">
              {expenses.map((expense) => (
                <li className="expense-item" key={expense.id}>
                  <div className="expense-main">
                    <strong>{expense.concept}</strong>
                    <span>
                      {expense.category} · {dateFormatter.format(new Date(expense.createdAt))}
                    </span>
                  </div>
                  <span className="expense-amount">
                    {currencyFormatter.format(expense.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
