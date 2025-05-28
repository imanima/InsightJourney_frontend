// Change from named export to default export
export default function EmotionPieChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]

  let startAngle = 0
  const slices = data.map((item, index) => {
    const percentage = (item.count / total) * 100
    const angle = (percentage / 100) * 360
    const endAngle = startAngle + angle

    // Calculate SVG arc path
    const x1 = 100 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180)
    const y1 = 100 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180)
    const x2 = 100 + 80 * Math.cos(((endAngle - 90) * Math.PI) / 180)
    const y2 = 100 + 80 * Math.sin(((endAngle - 90) * Math.PI) / 180)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [`M 100 100`, `L ${x1} ${y1}`, `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

    const slice = {
      path: pathData,
      color: colors[index % colors.length],
    }

    startAngle = endAngle
    return slice
  })

  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      {slices.map((slice, index) => (
        <path key={index} d={slice.path} fill={slice.color} stroke="white" strokeWidth="1" />
      ))}
    </svg>
  )
}

