"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X, ChevronDown } from 'lucide-react'
import TickerChart from "@/components/ticker-chart"
import TickerTable from "@/components/ticker-table"
import { parseCSV, type TickerData } from "@/lib/csv-parser"


export default function Page() {
  const [data, setData] = useState<TickerData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTickers, setSelectedTickers] = useState<string[]>([])
  const [tickerInput, setTickerInput] = useState("")
  const [availableTickers, setAvailableTickers] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"returns" | "prices">("prices")
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Load and parse CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data/fds_bkln_equs_daily_hist.csv")
        const csvText = await response.text()
        const parsedData = parseCSV(csvText)
        console.log(parsedData)
        setData(parsedData)

        // Extract unique tickers
        const tickers = [...new Set(parsedData.map((item) => item.ticker))].sort()
        setAvailableTickers(tickers)

        // Select first ticker by default
        if (tickers.length > 0) {
          setSelectedTickers([tickers[0]])
        }

        setLoading(false)
      } catch (error) {
        console.error("Error loading CSV data:", error)
        setLoading(false)
      }
    }

    loadData()
  }, [])



  // Filter available tickers based on input
  const filteredTickers = tickerInput
    ? availableTickers.filter(ticker => 
        ticker.includes(tickerInput.toUpperCase()))
    : availableTickers;

  // Filter data based on selected tickers
  const filteredData = data.filter((item) => selectedTickers.includes(item.ticker))

  // Add a ticker
  const addTicker = () => {
    const ticker = tickerInput.trim().toUpperCase()
    if (ticker && availableTickers.includes(ticker) && !selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker])
      setTickerInput("")
    }
  }

  // Remove a ticker
  const removeTicker = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker))
  }

  // Clear all tickers
  const clearTickers = () => {
    setSelectedTickers([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading ticker data...</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Daily Returns</h1>

      {/* Ticker Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Tickers</CardTitle>
          <CardDescription>Choose one or more tickers to visualize</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTickers.map((ticker) => (
              <Badge key={ticker} variant="secondary" className="text-sm py-1 px-3">
                {ticker}
                <button onClick={() => removeTicker(ticker)} className="ml-2 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedTickers.length === 0 && <div className="text-muted-foreground">No tickers selected</div>}
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              {/* Input with chevron button */}
              <div className="relative">
                <Input
                  placeholder="Enter ticker symbol"
                  value={tickerInput}
                  onChange={(e) => {
                    setTickerInput(e.target.value.toUpperCase());
                    if (e.target.value) {
                      setShowDropdown(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTicker();
                      setShowDropdown(false);
                    } else if (e.key === "Escape") {
                      setShowDropdown(false);
                    } else if (e.key === "ArrowDown" && filteredTickers.length > 0) {
                      setHighlightedIndex(0);
                      setShowDropdown(true);
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="pr-10 focus-visible:ring-2 focus-visible:ring-custom-gold/50"
                />
                
                {/* Chevron button to toggle dropdown */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="Toggle dropdown"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Custom dropdown menu */}
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md border border-border shadow-lg max-h-60 overflow-y-auto">
                  {filteredTickers.length > 0 ? (
                    <div className="py-1">
                      {filteredTickers.map((ticker, index) => (
                        <div
                          key={ticker}
                          className={`px-4 py-2 text-sm cursor-pointer ${
                            index === highlightedIndex ? "bg-muted" : "hover:bg-muted/50"
                          } ${selectedTickers.includes(ticker) ? "text-muted-foreground" : "text-foreground"}`}
                          onClick={() => {
                            setTickerInput(ticker);
                            setShowDropdown(false);
                            if (!selectedTickers.includes(ticker)) {
                              setTimeout(() => addTicker(), 100);
                            }
                          }}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{ticker}</span>
                            {selectedTickers.includes(ticker) && (
                              <span className="text-xs text-muted-foreground">Already added</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm">
                      {tickerInput ? (
                        <div className="flex flex-col items-center text-center">
                          <div className="text-destructive font-medium mb-1">No matching tickers found</div>
                          <div className="text-muted-foreground text-xs">
                            "{tickerInput}" is not available in the dataset
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Start typing to search for tickers</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Enhanced Add button with dynamic states */}
            <Button 
              onClick={() => {
                addTicker();
                setShowDropdown(false);
              }} 
              className={`transition-all duration-200 ${
                tickerInput && availableTickers.includes(tickerInput) && !selectedTickers.includes(tickerInput)
                  ? "bg-custom-gold hover:bg-custom-gold/90 text-black scale-105 shadow-md"
                  : "bg-custom-gold/70 text-black/80 hover:bg-custom-gold/80"
              }`}
              disabled={!tickerInput || !availableTickers.includes(tickerInput) || selectedTickers.includes(tickerInput)}
            >
              {tickerInput && availableTickers.includes(tickerInput) && !selectedTickers.includes(tickerInput) 
                ? "Add" 
                : selectedTickers.includes(tickerInput)
                  ? "Added"
                  : "Add"}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearTickers} 
              className="border-black text-black hover:bg-black/10"
              disabled={selectedTickers.length === 0}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Tabs */}
      <Tabs defaultValue="prices" onValueChange={(value) => setActiveTab(value as "returns" | "prices")}>
        <TabsList className="mb-4">
          <TabsTrigger value="prices">Prices</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="prices">
          {/* Chart View */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>Daily prices for selected tickers over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {selectedTickers.length > 0 ? (
                <TickerChart data={filteredData} tickers={selectedTickers} dataType="prices" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select at least one ticker to display the chart
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Tabular view of the selected ticker data</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTickers.length > 0 ? (
                <TickerTable data={filteredData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">Select at least one ticker to display data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          {/* Chart View */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Returns Chart</CardTitle>
              <CardDescription>Daily returns for selected tickers over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {selectedTickers.length > 0 ? (
                <TickerChart data={filteredData} tickers={selectedTickers} dataType="returns" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select at least one ticker to display the chart
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Tabular view of the selected ticker data</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTickers.length > 0 ? (
                <TickerTable data={filteredData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">Select at least one ticker to display data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}