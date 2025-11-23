// Utility functions to calculate breakdowns for index tooltips

import type { NetworkGeoJSON } from './types'

export interface BreakdownItem {
  label: string
  count: number
  percentage: number
}

/**
 * Calculate organization/provider breakdown from node data
 * Used for PDI (Physical Distribution Index) tooltips
 */
export function calculateOrgBreakdown(nodeData: NetworkGeoJSON): BreakdownItem[] {
  const orgCounts = new Map<string, number>()
  
  nodeData.features.forEach(feature => {
    const org = feature.properties.cloud_provider || 'Unknown'
    orgCounts.set(org, (orgCounts.get(org) || 0) + 1)
  })
  
  const total = nodeData.features.length
  
  return Array.from(orgCounts.entries()).map(([label, count]) => ({
    label,
    count,
    percentage: (count / total) * 100
  }))
}

/**
 * Calculate country breakdown from node data
 * Used for JDI (Jurisdictional Diversity Index) tooltips
 */
export function calculateCountryBreakdown(nodeData: NetworkGeoJSON): BreakdownItem[] {
  const countryCounts = new Map<string, number>()
  
  nodeData.features.forEach(feature => {
    const country = feature.properties.country || 'Unknown'
    countryCounts.set(country, (countryCounts.get(country) || 0) + 1)
  })
  
  const total = nodeData.features.length
  
  return Array.from(countryCounts.entries()).map(([label, count]) => ({
    label,
    count,
    percentage: (count / total) * 100
  }))
}

/**
 * Calculate ISP/ASN breakdown from node data
 * Used for IHI (Infrastructure Heterogeneity Index) tooltips
 */
export function calculateIspBreakdown(nodeData: NetworkGeoJSON): BreakdownItem[] {
  const ispCounts = new Map<string, number>()
  
  nodeData.features.forEach(feature => {
    const isp = feature.properties.isp || feature.properties.cloud_provider || 'Unknown'
    ispCounts.set(isp, (ispCounts.get(isp) || 0) + 1)
  })
  
  const total = nodeData.features.length
  
  return Array.from(ispCounts.entries()).map(([label, count]) => ({
    label,
    count,
    percentage: (count / total) * 100
  }))
}

