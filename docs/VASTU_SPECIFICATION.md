# Vedic Vastu Purusha Mandala Mathematical Specification

## 1. Foundational Coordinate Geometry

In Vastu Shastra, a building is conceptualized as an energetic mandala aligned to the cardinal compass axes. HomePlanner computes room alignment relative to the geometric plot centroid:

$$\vec{P} = \left( \frac{W_{\text{plot}}}{2}, \frac{L_{\text{plot}}}{2} \right)$$

For each room $R_i$ with Cartesian bounds $[x_i, y_i, w_i, l_i]$:

$$\vec{R}_i = \left( x_i + \frac{w_i}{2}, y_i + \frac{l_i}{2} \right)$$

The relative spatial displacement vector is:

$$\vec{D}_i = \vec{R}_i - \vec{P} = \left( x_i + \frac{w_i}{2} - \frac{W_{\text{plot}}}{2}, \frac{L_{\text{plot}}}{2} - \left( y_i + \frac{l_i}{2} \right) \right)$$

---

## 2. Compass Rotation Transformation

Given a site-specific True North deviation angle $\alpha \in [0, 360)^\circ$:

$$\theta_i = \text{atan2}(D_{i,y}, D_{i,x}) \times \frac{180}{\pi}$$
$$\text{Bearing}_i = (90 - \theta_i + 360) \pmod{360}$$
$$\text{True Bearing}_i = (\text{Bearing}_i + \alpha + 360) \pmod{360}$$

---

## 3. Eight-Quadrant Auspiciousness Matrix

| Sector | Quadrant | Primary Element | Auspicious Rooms | Rating Weight |
|---|---|---|---|---|
| $337.5^\circ - 22.5^\circ$ | North | Water (*Jala*) | Living, Foyer, Treasury | +15 |
| $22.5^\circ - 67.5^\circ$ | Northeast | Water / Void (*Akasha*) | Pooja, Meditation, Water Body | +25 |
| $67.5^\circ - 112.5^\circ$ | East | Air (*Vayu*) | Living, Verandah, Study | +10 |
| $112.5^\circ - 157.5^\circ$ | Southeast | Fire (*Tejas*) | Kitchen, Pantry, Electrical | +20 |
| $157.5^\circ - 202.5^\circ$ | South | Earth (*Prithvi*) | Bedroom, Staircase | +10 |
| $202.5^\circ - 247.5^\circ$ | Southwest | Earth (*Prithvi*) | Master Bedroom, Heavy Storage | +20 |
| $247.5^\circ - 292.5^\circ$ | West | Air (*Vayu*) | Dining, Children Bedroom | +10 |
| $292.5^\circ - 337.5^\circ$ | Northwest | Air (*Vayu*) | Guest Bedroom, Toilets | +10 |
