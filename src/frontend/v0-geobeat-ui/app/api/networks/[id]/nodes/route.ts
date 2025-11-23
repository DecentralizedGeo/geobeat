import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { parseNodeCSV, aggregateToHexbins } from '@/lib/hexbin-data'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: networkId } = await params

    // Get query params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'hexbins'
    const resolution = parseInt(searchParams.get('resolution') || '3', 10)

    // For Ethereum, load real data from CSV
    if (networkId === 'ethereum') {
      try {
        const csvPath = join(
          process.cwd(),
          '..',
          '..',
          '..',
          'data',
          'raw',
          '2025-11-22-ethereum-ips.csv'
        )

        const csvData = await readFile(csvPath, 'utf-8')
        const nodes = parseNodeCSV(csvData)

        if (format === 'points') {
          // Return point GeoJSON for heatmap
          const pointFeatures = nodes.map(node => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [node.lon, node.lat]
            },
            properties: {
              ip: node.ip,
              country: node.country,
              city: node.city
            }
          }))

          return NextResponse.json({
            type: 'FeatureCollection',
            features: pointFeatures
          })
        } else {
          // Return hexbins
          const hexbins = aggregateToHexbins(nodes, resolution)
          return NextResponse.json(hexbins)
        }
      } catch (csvError) {
        console.error('Failed to load Ethereum CSV:', csvError)
        // Fall through to return empty data
      }
    }

    // For other networks, return empty for now
    return NextResponse.json({
      type: 'FeatureCollection',
      features: []
    })

  } catch (error) {
    console.error('Error generating node data:', error)
    return NextResponse.json(
      { error: 'Failed to load node data' },
      { status: 500 }
    )
  }
}
