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

    // Get resolution from query params (default to 4)
    const { searchParams } = new URL(request.url)
    const resolution = parseInt(searchParams.get('resolution') || '4', 10)

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
        const hexbins = aggregateToHexbins(nodes, resolution)

        return NextResponse.json(hexbins)
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
