import { adminDB, adminStorage } from '../../../lib/adminAuth';

export async function POST(request) {
  try {
    const adData = await request.json();
    // Use "Categories" if exists, otherwise use "category"
    const categoryValue = adData.Categories || adData.category;
    
    const {
      images,
      city,
      type,         // Detailed value from the form (not used for search)
      description,
      price,
      deposit,
      postcode,
      address,
      observations,
      uId,          // ID of the user creating the ad
    } = adData;

    // Validate required fields
    const missingFields = [];
    if (!categoryValue) missingFields.push("Category");
    if (!city) missingFields.push("City");
    if (!type) missingFields.push("Type");
    if (!description) missingFields.push("Description");
    if (price === undefined || price === null) missingFields.push("Price");
    if (deposit === undefined || deposit === null) missingFields.push("Deposit");
    if (!postcode) missingFields.push("Postcode");
    if (!address) missingFields.push("Address");
    if (missingFields.length > 0) {
      const errorMsg = "Missing required fields: " + missingFields.join(", ");
      console.error(errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Map the category value to search fields "transaction" and "type"
    let transaction = '';
    let searchType = '';
    if (categoryValue === 'sell-property') {
      transaction = 'Buy';
      searchType = 'Homes';
    } else if (categoryValue === 'rent-property') {
      transaction = 'Rent';
      searchType = 'Homes';
    } else if (categoryValue === 'rent-room') {
      transaction = 'Rent';
      searchType = 'Rooms';
    }

    // Create the ad document with adjusted fields
    const adDocument = {
      originalCategory: categoryValue, // Stores the submitted category value
      transaction,                     // Field used for search (Buy or Rent)
      type: searchType,                // Field used for search (Homes or Rooms)
      city,
      description,
      price: Number(price),
      deposit: Number(deposit),
      postcode,
      address,
      observations,
      images: [], // Initially empty; will store public image URLs
      createdAt: new Date(),
      checked: false,
      status: true,
      suspend: false, // Change to true if the ad should start suspended
      views: 0,
      viewsDetails: 0,
      createdBy: uId,
    };

    // Add the document to the 'ads-uk' collection and get its ID (adId)
    const docRef = await adminDB.collection('ads-uk').add(adDocument);
    const adId = docRef.id;

    // Array to store public URLs of images
    const imageUrls = [];

    // If there are images, upload them using the folder structure: 'ads-uk/uId/adId/file'
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        let imageData = images[i];
        let base64Str = imageData;
        let contentType = 'image/jpeg';

        // Check if the string contains the header "data:image/..."
        if (imageData.startsWith('data:')) {
          const matches = imageData.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          if (matches) {
            contentType = matches[1];
            base64Str = matches[2];
          }
        }

        const buffer = Buffer.from(base64Str, 'base64');
        const fileExtension = contentType.split('/')[1];
        // Create the file path using uId and adId
        const fileName = `ads-uk/${uId}/${adId}/${Date.now()}_${i}.${fileExtension}`;
        const file = adminStorage.file(fileName);

        // Save the file to the bucket with metadata for the content type
        await file.save(buffer, {
          metadata: { contentType },
        });

        // Make the file public
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${fileName}`;
        imageUrls.push(publicUrl);
      }
    }

    // Update the document with the image URLs
    await adminDB.collection('ads-uk').doc(adId).update({ images: imageUrls });

    return new Response(JSON.stringify({ success: true, id: adId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating ad: ", error);
    // Return a generic error message to the client, detailed error is logged on the server
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again later." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
