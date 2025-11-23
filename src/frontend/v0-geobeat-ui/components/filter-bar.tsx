"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function FilterBar() {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground font-medium">Networks:</span>
          <Select defaultValue="all">
            <SelectTrigger className="h-8 w-[140px] bg-transparent border-border rounded-sm text-sm">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="l1">Layer 1</SelectItem>
              <SelectItem value="l2">Layer 2</SelectItem>
              <SelectItem value="app">App Chain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground font-medium">Sort:</span>
          <Select defaultValue="gdi">
            <SelectTrigger className="h-8 w-[140px] bg-transparent border-border rounded-sm text-sm">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gdi">GDI</SelectItem>
              <SelectItem value="pdi">PDI</SelectItem>
              <SelectItem value="jdi">JDI</SelectItem>
              <SelectItem value="ihi">IHI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground/60">
        Sort by any dimension to explore distribution patterns
      </span>
    </div>
  )
}
