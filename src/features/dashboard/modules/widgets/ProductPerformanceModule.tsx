import { useState } from 'react'
import { ModuleFrame } from '../../components/ModuleFrame'

const TOP = [
  { name: 'Wireless Earbuds Pro', sku: 'WB-2041', sales: '₹2.4L', orders: 412, revenue: '₹2.1L', growth: '+18%' },
  { name: 'Smart Watch Series 5', sku: 'SW-1180', sales: '₹1.9L', orders: 286, revenue: '₹1.7L', growth: '+12%' },
  { name: 'USB-C Hub 7-in-1', sku: 'HB-3302', sales: '₹1.2L', orders: 198, revenue: '₹1.0L', growth: '+9%' },
]

export function ProductPerformanceModule() {
  const [tab, setTab] = useState<'top' | 'low'>('top')

  return (
    <ModuleFrame title="Product Performance" status="success" error={null} className="chart-card product-card">
      <div className="product-tabs">
        <button
          type="button"
          className={tab === 'top' ? 'product-tabs__btn product-tabs__btn--active' : 'product-tabs__btn'}
          onClick={() => setTab('top')}
        >
          Top Products
        </button>
        <button
          type="button"
          className={tab === 'low' ? 'product-tabs__btn product-tabs__btn--active' : 'product-tabs__btn'}
          onClick={() => setTab('low')}
        >
          Low Performing
        </button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Sales</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Growth</th>
          </tr>
        </thead>
        <tbody>
          {(tab === 'top' ? TOP : TOP.slice().reverse()).map((row) => (
            <tr key={row.sku}>
              <td>
                <span className="product-table__name">{row.name}</span>
                <span className="product-table__sku">{row.sku}</span>
              </td>
              <td>{row.sales}</td>
              <td>{row.orders}</td>
              <td>{row.revenue}</td>
              <td className="product-table__growth">{row.growth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModuleFrame>
  )
}
