export const CITY_RATES = {
  Mumbai: { name: "Mumbai (Metropolitan)", rate: 2500 },
  Bangalore: { name: "Bangalore (Tech Hub)", rate: 2000 },
  Hyderabad: { name: "Hyderabad (Deccan)", rate: 1800 },
  Tier2: { name: "Tier-2 Cities (Development)", rate: 1400 },
};

/**
 * Calculates estimated construction costs for a floor plan.
 * Returns { city, rate, totalCarpetArea, totalBuiltUpArea, totalCost, breakdown }
 */
export function estimateCost(rooms = [], cityKey = "Bangalore") {
  const cityData = CITY_RATES[cityKey] || CITY_RATES.Bangalore;
  const rate = cityData.rate;

  let totalCarpetArea = 0;
  const roomBreakdown = rooms.map((room) => {
    const area = room.width * room.length;
    totalCarpetArea += area;
    const cost = area * rate;
    return {
      name: room.name,
      floor: room.floor,
      type: room.type,
      area: Math.round(area),
      cost: Math.round(cost),
    };
  });

  // Construction has an overhead for walls, columns, stairs, and passages (approx 18%)
  const overheadFactor = 1.18;
  const totalBuiltUpArea = totalCarpetArea * overheadFactor;
  const totalCost = totalBuiltUpArea * rate;

  return {
    city: cityData.name,
    rate,
    totalCarpetArea: Math.round(totalCarpetArea),
    totalBuiltUpArea: Math.round(totalBuiltUpArea),
    totalCost: Math.round(totalCost),
    breakdown: roomBreakdown,
  };
}
