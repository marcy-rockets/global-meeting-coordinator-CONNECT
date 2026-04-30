import { NextRequest, NextResponse } from 'next/server';

const CALENDARIFIC_API_KEY = process.env.CALENDARIFIC_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const year = searchParams.get('year');

  if (!CALENDARIFIC_API_KEY) {
    return NextResponse.json({ error: 'API Key missing on server' }, { status: 500 });
  }

  if (!country || !year) {
    return NextResponse.json({ error: 'Missing country or year' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://calendarific.com/api/v2/holidays?api_key=${CALENDARIFIC_API_KEY}&country=${country}&year=${year}`
    );

    if (!res.ok) {
      throw new Error(`Calendarific API responded with ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data.response.holidays || []);
  } catch (error: any) {
    console.error('Holiday API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
