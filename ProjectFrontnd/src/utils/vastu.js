/**
 * Computes Vastu compliance for a room.
 * North direction defaults to 0 (top of the page is North).
 * Returns { zone: string, rating: 'green'|'amber'|'red', description: string, ideal: string }
 */
export function evaluateVastu(room, plotWidth, plotLength, northDirection = 0) {
  // Centroid of room
  const rx = room.x + room.width / 2;
  const ry = room.y + room.length / 2;

  // Centroid of plot
  const px = plotWidth / 2;
  const py = plotLength / 2;

  // Offset vector (in Cartesian: dy is positive upwards, dx is positive rightwards)
  const dx = rx - px;
  const dy = py - ry; // In SVG, y goes down, so invert to get standard cartesian y

  // Distance from plot centroid
  const distFromCenter = Math.hypot(dx, dy);
  const plotRadius = Math.hypot(px, py);

  let zone = "";
  // Check if room centroid is in the central zone (Brahmasthan)
  if (plotRadius > 0 && distFromCenter / plotRadius < 0.18) {
    zone = "C";
  } else {
    // Calculate angle in degrees from East (0 deg)
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI); // -180 to 180

    // Convert to compass bearing (0 = North, 90 = East, 180 = South, 270 = West)
    const bearing = (90 - angleDeg + 360) % 360;

    // Apply North rotation offset (relative to true north)
    const adjustedBearing = ((bearing - northDirection) % 360 + 360) % 360;

    // Map bearing to 8 compass zones
    if (adjustedBearing >= 337.5 || adjustedBearing < 22.5) zone = "N";
    else if (adjustedBearing >= 22.5 && adjustedBearing < 67.5) zone = "NE";
    else if (adjustedBearing >= 67.5 && adjustedBearing < 112.5) zone = "E";
    else if (adjustedBearing >= 112.5 && adjustedBearing < 157.5) zone = "SE";
    else if (adjustedBearing >= 157.5 && adjustedBearing < 202.5) zone = "S";
    else if (adjustedBearing >= 202.5 && adjustedBearing < 247.5) zone = "SW";
    else if (adjustedBearing >= 247.5 && adjustedBearing < 292.5) zone = "W";
    else zone = "NW";
  }

  // Vastu guidelines lookup table
  const roomRules = {
    pooja: {
      ideal: "NE",
      good: ["N", "E"],
      description: "Pooja room must ideally be in the Northeast (NE) Ishanya corner to draw positive spiritual energy. North and East are also auspicious.",
    },
    kitchen: {
      ideal: "SE",
      good: ["NW"],
      description: "Kitchen should ideally be in the Southeast (SE) Agni fire zone. Northwest (NW) is an acceptable secondary location.",
    },
    bedroom: {
      ideal: "SW",
      good: ["W", "S", "NW"],
      description: "Master Bedroom must be in the Southwest (SW) Nairutya for stability. Guest/Children rooms can be in West, South, or Northwest.",
    },
    bathroom: {
      ideal: "NW",
      good: ["W", "S"],
      description: "Bathrooms are best located in the Northwest (NW) or West (W). Never place in Northeast (NE) or center (Brahmasthan).",
    },
    living: {
      ideal: "N",
      good: ["E", "NE", "NW", "C"],
      description: "Living rooms are ideal in the North (N) or East (E) for welcoming energy. Northeast (NE), Northwest (NW), and Center (C) are also good.",
    },
    dining: {
      ideal: "W",
      good: ["E", "SE", "C"],
      description: "Dining area is best in the West (W) or East (E). Central transition space is also acceptable.",
    },
    balcony: {
      ideal: "NE",
      good: ["N", "E"],
      description: "Balconies should face North (N), East (E) or Northeast (NE) for early natural light and ventilation.",
    },
    office: {
      ideal: "N",
      good: ["NE", "E", "W"],
      description: "Home office/study is best in North (Mercury intellectual zone) or Northeast for clarity and business prosperity.",
    },
    staircase: {
      ideal: "S",
      good: ["SW", "W"],
      description: "Staircases should be located in the South, West, or Southwest to anchor heavy structural loads. Avoid Northeast.",
    },
    garage: {
      ideal: "NW",
      good: ["SE", "N", "E"],
      description: "Parking/garage is ideal in Northwest (Vayu zone of motion) or Southeast.",
    },
    parking: {
      ideal: "NW",
      good: ["SE", "N", "E"],
      description: "Vehicle parking is ideal in Northwest or Southeast corners.",
    },
    garden: {
      ideal: "N",
      good: ["NE", "E"],
      description: "Gardens, green courtyards, and light plants thrive best in North, Northeast, and East.",
    },
    hallway: {
      ideal: "C", // Center/Lobby (Brahmasthan / circulation)
      good: ["N", "E", "W", "S", "NE", "NW", "SE", "SW"],
      description: "Hallways/lobbies can occupy any zone, but central transition area (C) is ideal for circulation flow.",
    },
  };

  const type = room.type?.toLowerCase() || "hallway";
  const rule = roomRules[type] || roomRules.hallway;

  let rating = "red";
  let evaluation = "Non-compliant direction.";

  // Strict check: Bathroom in center Brahmasthan is highly inauspicious
  if (type === "bathroom" && zone === "C") {
    rating = "red";
    evaluation = "Critical Vastu defect: Bathrooms must never occupy the sacred central Brahmasthan.";
  } else if (zone === rule.ideal) {
    rating = "green";
    evaluation = `Excellent! Ideal Vastu zone (${zone}).`;
  } else if (rule.good.includes(zone)) {
    rating = "amber";
    evaluation = `Favorable/Neutral Vastu zone (${zone}).`;
  } else {
    evaluation = `Suboptimal Vastu zone (${zone}). Ideally should be located in ${rule.ideal}.`;
  }

  return {
    zone,
    rating,
    evaluation,
    description: rule.description,
    ideal: rule.ideal,
  };
}

export function computeOverallVastuScore(rooms, plotWidth, plotLength, northDirection = 0) {
  if (!rooms || rooms.length === 0) return 0;
  
  let scoreSum = 0;
  rooms.forEach((room) => {
    const result = evaluateVastu(room, plotWidth, plotLength, northDirection);
    if (result.rating === "green") scoreSum += 100;
    else if (result.rating === "amber") scoreSum += 60;
    else scoreSum += 20; // minor points for existence
  });

  return Math.round(scoreSum / rooms.length);
}
