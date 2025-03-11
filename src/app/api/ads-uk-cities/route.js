import { NextResponse } from 'next/server';

// Simulação de um banco de dados ou Firestore (substitua conforme necessário)
const mockCities = [
  { id: 1, name: 'Glasgow' }
];

export async function GET() {
  try {
    return NextResponse.json({ cities: mockCities });
  } catch (error) {
    console.error('Error to find the cities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
