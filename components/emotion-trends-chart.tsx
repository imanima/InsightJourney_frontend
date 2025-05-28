// Change from named export to default export
export default function EmotionTrendsChart({ data }: { data: any[] }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      {/* Line for emotion trend */}
      {(() => {
        const points = data
          .map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 50 - (item.intensity / 4) * 50
            return `${x},${y}`
          })
          .join(" ")

        return (
          <g>
            <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="1" />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 50 - (item.intensity / 4) * 50
              return <circle key={index} cx={x} cy={y} r="1.5" fill="#3b82f6" />
            })}
          </g>
        )
      })()}
    </svg>
  )
}

