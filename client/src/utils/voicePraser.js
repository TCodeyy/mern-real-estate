export function parseAIVoiceCommand(command) {
  const cmd = command.toLowerCase().trim();

  const numberWords = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  function wordToNumber(word) {
    return numberWords[word.toLowerCase()] || null;
  }

  const filters = {
    type: 'all',
    furnished: false,
    parking: false,
    offer: false,
    searchTerm: '',
    bedrooms: null,
    bathrooms: null,
    priceRange: null,
  };

  if (cmd.match(/\b(rent|rental|renting|for rent)\b/)) {
    filters.type = 'rent';
  } else if (
    cmd.match(/\b(sale|sell|selling|buy|buying|purchase|for sale)\b/)
  ) {
    filters.type = 'sale';
  }

  if (cmd.match(/\b(furnished|furniture|with furniture)\b/)) {
    filters.furnished = true;
  }
  if (cmd.match(/\b(parking|garage|car space|parking spot)\b/)) {
    filters.parking = true;
  }
  if (cmd.match(/\b(offer|deal|discount|special)\b/)) {
    filters.offer = true;
  }

  const bedroomPatterns = [
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[-\s]*(?:bed|bedroom|br)s?\b/,
    /\b(?:with|having)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[-\s]*(?:bed|bedroom|br)s?\b/,
  ];
  for (const pattern of bedroomPatterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      let bedrooms = parseInt(match[1]);
      if (isNaN(bedrooms)) {
        bedrooms = wordToNumber(match[1]);
      }
      filters.bedrooms = bedrooms;
      break;
    }
  }

  const bathroomPatterns = [
    /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[-\s]*(?:bath|bathroom|ba)s?\b/,
    /\b(?:with|having)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[-\s]*(?:bath|bathroom|ba)s?\b/,
  ];
  for (const pattern of bathroomPatterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      let bathrooms = parseInt(match[1]);
      if (isNaN(bathrooms)) {
        bathrooms = wordToNumber(match[1]);
      }
      filters.bathrooms = bathrooms;
      break;
    }
  }

  const priceMatch = cmd.match(
    /(?:under|below|less than|maximum)\s*\$?(\d+(?:,\d{3})*(?:k|thousand)?)/
  );
  if (priceMatch) {
    let price = priceMatch[1].replace(/,/g, '');
    if (price.includes('k') || price.includes('thousand')) {
      price = parseInt(price.replace(/[k,thousand]/g, '')) * 1000;
    } else {
      price = parseInt(price);
    }
    filters.priceRange = { max: price };
  }

  const locationPatterns = [
    /(?:in|at|near|around|close to)\s+([\w\s,]+?)(?:\s+(?:area|neighborhood|district|city|town))?$/,
    /(?:looking for|find|search for).*?(?:in|at|near)\s+([\w\s,]+?)(?:\s+(?:area|neighborhood))?$/,
    /properties?\s+(?:in|at|near)\s+([\w\s,]+?)(?:\s+(?:area|neighborhood))?$/,
  ];
  for (const pattern of locationPatterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      filters.searchTerm = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  return filters;
}
