import { NextResponse } from 'next/server';

// Simulação de um banco de dados ou Firestore (substitua conforme necessário)
const mockCities = [
  { id: 1, name: 'Madrid' },
  { id: 2, name: 'Barcelona' },
  { id: 3, name: 'Valencia' },
  { id: 4, name: 'Seville' },
  { id: 5, name: 'Malaga' }
];

export async function GET() {
  try {
    return NextResponse.json({ cities: mockCities });
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
