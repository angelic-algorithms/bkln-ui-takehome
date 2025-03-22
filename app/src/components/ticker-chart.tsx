"use client"

import { useMemo, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { TickerData } from "../lib/csv-parser"

// Define chart colors
const CHART_COLORS = [
  "hsl(222.2 47.4% 11.2%)",
  "hsl(0 84.2% 60.2%)",
  "hsl(217.2 91.2% 59.8%)",
  "hsl(262.1 83.3% 57.8%)",
  "hsl(24.6 95% 53.1%)",
  "hsl(142.1 76.2% 36.3%)",
]

interface TickerChartProps {
  data: TickerData[]
  tickers: string[]
  dataType: "returns" | "prices"
}

export default function TickerChart({ data, tickers, dataType }: TickerChartProps) {
  // Track whether nodes are visible
  const [showNodes, setShowNodes] = useState(true);

  // Process data for the chart
  const chartData = useMemo(() => {
    // Group data by date
    const groupedByDate = data.reduce(
      (acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { date: item.date }
        }

        // Add the value for this ticker on this date
        const value = dataType === "prices" ? item.price : item.ret
        acc[item.date][item.ticker] = value

        return acc
      },
      {} as Record<string, any>,
    )

    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [data, dataType])

  // Format date for x-axis
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(2)}`
  }

  // Format tooltip value
  const formatValue = (value: number) => {
    if (dataType === "returns") {
      // Format as percentage
      return `${(value * 100).toFixed(2)}%`
    }
    // Format as currency
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toggle button for nodes */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowNodes(!showNodes)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            showNodes 
              ? "bg-custom-gold text-black hover:bg-custom-gold/90" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {showNodes ? "Hide Nodes" : "Show Nodes"}
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={50} />
          <YAxis
            tickFormatter={(value) => (dataType === "returns" ? `${(value * 100).toFixed(0)}%` : `$${value.toFixed(0)}`)}
          />
          <Tooltip formatter={(value: number, name: string) => [formatValue(value), name]} labelFormatter={formatDate} />
          <Legend />
          
          {tickers.map((ticker, index) => (
            <Line
              key={ticker}
              type="monotone"
              dataKey={ticker}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              // Only show activeDot if showNodes is true
              activeDot={showNodes ? { r: 8 } : false}
              // Also control the regular dots
              dot={showNodes ? { r: 3 } : false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}