import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'API 서버가 정상 작동 중입니다' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      message: 'POST 요청 성공',
      received: body
    })
  } catch (error) {
    console.error('테스트 API 오류:', error)
    return NextResponse.json({
      error: 'POST 요청 실패',
      details: error
    }, { status: 500 })
  }
}
