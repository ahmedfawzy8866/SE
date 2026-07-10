import { NextRequest, NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/server/auth-guard';
import { PropertyFinderService } from '@/lib/services/PropertyFinderService';

const pfService = PropertyFinderService.getInstance();

export async function GET(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint') || 'properties';
  const params = Object.fromEntries(searchParams.entries());
  delete params.endpoint;

  try {
    const result = await pfService.get(endpoint, params);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[property-finder GET] error:', err);
    return NextResponse.json({ error: 'Property Finder request failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint, data } = body;

  try {
    const result = await pfService.post(endpoint, data);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[property-finder POST] error:', err);
    return NextResponse.json({ error: 'Property Finder request failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint, data } = body;

  try {
    const result = await pfService.put(endpoint, data);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[property-finder PUT] error:', err);
    return NextResponse.json({ error: 'Property Finder request failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await verifyRequest(req);
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint') || '';

  try {
    const result = await pfService.delete(endpoint);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[property-finder DELETE] error:', err);
    return NextResponse.json({ error: 'Property Finder request failed' }, { status: 500 });
  }
}
