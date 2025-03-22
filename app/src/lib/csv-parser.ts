export interface TickerData {
    date: string;
    ticker: string;
    ret: number;
    price: number;
  }
  
  export function parseCSV(csvText: string): TickerData[] {
    // Split the CSV text into lines
    const lines = csvText.trim().split("\n");
  
    // Extract headers (first line)
    const headers = lines[0].split(",").map((header) => header.trim());
  
    // Map column indices
    const dateIndex = headers.indexOf("date");
    const tickerIndex = headers.indexOf("ticker");
    const retIndex = headers.indexOf("ret");
    const priceIndex = headers.indexOf("price");
  
    // Parse data rows
    const data: TickerData[] = [];
  
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((value) => value.trim());
  
      // Skip invalid rows
      if (values.length !== headers.length) continue;
  
      data.push({
        date: values[dateIndex],
        ticker: values[tickerIndex],
        ret: Number.parseFloat(values[retIndex]),
        price: Number.parseFloat(values[priceIndex]),
      });
    }
  
    return data;
  }