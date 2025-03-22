"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TickerData } from "../lib/csv-parser"

interface TickerTableProps {
  data: TickerData[]
}

type SortField = "date" | "ticker" | "ret" | "price"
type SortDirection = "asc" | "desc"

export default function TickerTable({ data }: TickerTableProps) {
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <ChevronsUpDown className="ml-2 h-4 w-4" />
    return sortDirection === "asc" ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  // Filter and sort data
  const filteredAndSortedData = [...data]
    .filter((item) => item.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || item.date.includes(searchTerm))
    .sort((a, b) => {
      let comparison = 0

      if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortField === "ticker") {
        comparison = a.ticker.localeCompare(b.ticker)
      } else {
        comparison = a[sortField] - b[sortField]
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage)
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search by ticker..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset to first page on search
          }}
          className="max-w-xs"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-black text-black hover:bg-black/10">
              Sort by: {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
              {getSortIcon(sortField)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("date")}>Date {getSortIcon("date")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("ticker")}>Ticker {getSortIcon("ticker")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("ret")}>Return {getSortIcon("ret")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("price")}>Price {getSortIcon("price")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("date")}
                  className="flex items-center text-black hover:bg-black/10"
                >
                  Date {getSortIcon("date")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("ticker")}
                  className="flex items-center text-black hover:bg-black/10"
                >
                  Ticker {getSortIcon("ticker")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("ret")}
                  className="flex items-center justify-end ml-auto text-black hover:bg-black/10"
                >
                  Return {getSortIcon("ret")}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("price")}
                  className="flex items-center justify-end ml-auto text-black hover:bg-black/10"
                >
                  Price {getSortIcon("price")}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={`${item.date}-${item.ticker}-${index}`}>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell className="font-medium">{item.ticker}</TableCell>
                  <TableCell className="text-right">
                    <span className={item.ret >= 0 ? "text-green-600" : "text-red-600"}>
                      {(item.ret * 100).toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length}{" "}
            entries
          </div>
          <div className="flex gap-1">
            {/* Skip to First Page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="border-black text-black hover:bg-black/10"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            {/* Previous Page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-black text-black hover:bg-black/10"
            >
              Previous
            </Button>
            
            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum = currentPage;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-custom-gold hover:bg-custom-gold/90 text-black"
                        : "border-black text-black hover:bg-black/10"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            {/* Next Page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-black text-black hover:bg-black/10"
            >
              Next
            </Button>
            
            {/* Skip to Last Page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="border-black text-black hover:bg-black/10"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}