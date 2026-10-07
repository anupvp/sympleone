import { ModuleFrame } from '../../components/ModuleFrame'

const ROWS = [
  { name: 'Electronics', sales: '₹4.8L', orders: 642, revenue: '₹4.2L', growth: '+14%' },
  { name: 'Fashion', sales: '₹3.2L', orders: 518, revenue: '₹2.9L', growth: '+11%' },
  { name: 'Home & Kitchen', sales: '₹2.1L', orders: 312, revenue: '₹1.8L', growth: '+8%' },
  { name: 'Beauty', sales: '₹1.4L', orders: 245, revenue: '₹1.2L', growth: '+6%' },
]

export function TopCategoriesModule() {
  return (
    <ModuleFrame title="Top Product Categories" status="success" error={null} className="chart-card categories-card">
      <table className="product-table product-table--compact">
        <thead>
          <tr>
            <th>Category</th>
            <th>Sales</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Growth</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
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
