import { ModuleFrame } from '../../components/ModuleFrame'

const REGIONS = [
  { name: 'North America', value: '₹4.2L', growth: '+12.4%', x: '22%', y: '38%' },
  { name: 'Europe', value: '₹3.1L', growth: '+8.1%', x: '48%', y: '32%' },
  { name: 'India', value: '₹2.8L', growth: '+15.2%', x: '62%', y: '52%' },
  { name: 'Middle East', value: '₹1.4L', growth: '+6.3%', x: '58%', y: '44%' },
  { name: 'Rest of World', value: '₹0.9L', growth: '+4.0%', x: '75%', y: '58%' },
]

export function SalesByRegionModule() {
  return (
    <ModuleFrame title="Sales by Region" status="success" error={null} className="chart-card region-card">
      <div className="region-map">
        <div className="region-map__bg" aria-hidden />
        {REGIONS.map((r) => (
          <div
            key={r.name}
            className="region-pin"
            style={{ left: r.x, top: r.y }}
          >
            <span className="region-pin__dot" />
            <div className="region-pin__card">
              <strong>{r.name}</strong>
              <span>{r.value}</span>
              <em>{r.growth}</em>
            </div>
          </div>
        ))}
      </div>
    </ModuleFrame>
  )
}
