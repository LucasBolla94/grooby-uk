import { adminDB } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, id, data } = body;
    
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const adRef = adminDB.collection('ads-uk').doc(id);

    if (action === 'edit') {
      // Atualiza o anúncio com os dados fornecidos
      await adRef.update(data);
      return NextResponse.json({ success: true, message: 'Listing updated successfully' });
    } else if (action === 'delete') {
      // Deleta o anúncio
      await adRef.delete();
      return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
    } else if (action === 'pause') {
      // Atualiza o anúncio para pausado (definindo suspend como true)
      await adRef.update({ suspend: true });
      return NextResponse.json({ success: true, message: 'Listing paused successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in edit-ads API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
