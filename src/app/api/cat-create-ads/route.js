export async function GET(req) {
  try {
    const categories = [
      { 
        id: 'rent-property', 
        name: 'Rent Property',
        formFields: ['Property Type', 'Price', 'Deposit', 'Description', 'City', 'Address', 'PostCode'],
        propertyTypes: [
          'Flat / Apartment', 'Studio Flat', 'Maisonette', 'Terraced House', 'Semi-Detached House', 'Detached House', 'Bungalow', 'Cottage', 'Houseboat'
        ]
      },
      { 
        id: 'rent-room', 
        name: 'Rent Room',
        formFields: ['Room Type', 'Price', 'Deposit', 'Description', 'Shared Amenities', 'City', 'Address', 'PostCode'],
        propertyTypes: [
          'Single Room', 'Double Room', 'En-suite Room', 'Studio', 'Shared Accommodation',
        ]
      },
      { 
        id: 'sell-property', 
        name: 'Sell Property',
        formFields: ['Property Type', 'Selling Price', 'Description', 'City', 'Address', 'PostCode'],
        propertyTypes: [
          'Flat / Apartment', 'Studio Flat', 'Maisonette', 'Terraced House', 'Semi-Detached House', 'Detached House', 'Bungalow', 'Cottage', 'Houseboat', 'Commercial Property', 'Land / Plot'
        ]
      }
    ];

    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
