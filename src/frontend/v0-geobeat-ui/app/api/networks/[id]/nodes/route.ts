import { NextResponse } from 'next/server'
import { generateMockNodeData } from '@/lib/mock-node-data'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: networkId } = await params

    // For v0: Generate mock node data
    // TODO: Replace with real data from backend API or database
    const nodeData = generateMockNodeData(networkId)

    return NextResponse.json(nodeData)
  } catch (error) {
    console.error('Error generating node data:', error)
    return NextResponse.json(
      { error: 'Failed to load node data' },
      { status: 500 }
    )
  }
}
