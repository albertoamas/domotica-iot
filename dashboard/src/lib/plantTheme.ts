// ════════════════════════════════════════════════════════════════════════
//  Sistema de diseño — Plant Monitor
//  Paleta café/tierra cálida con acentos verde planta
// ════════════════════════════════════════════════════════════════════════

export const PT = {
  // ── Fondo de página (café profundo) ──
  pageGrad:  'linear-gradient(180deg, #41301F 0%, #2B1F14 100%)',
  pageBg:    '#33251A',

  // ── Tierra / navbar ──
  soil:      '#5E4129',   // tierra cálida
  soilDark:  '#3D2817',   // tierra oscura (bordes/sombra)
  grass:     '#74AD3A',   // pasto verde

  // ── Tarjetas (crema cálida) ──
  card:      '#FBF7F0',   // crema (card principal)
  cardRaise: '#F4ECDD',   // beige elevado (tiles interiores)
  cardSunk:  '#EFE4D2',   // beige hundido (pistas/tracks)
  border:    '#E6D8C1',   // tan claro (borde de card)
  borderDim: '#EFE7D8',   // separadores sutiles

  // ── Acentos ──
  green:     '#5C8A2E',   // verde planta
  greenDeep: '#3F6B1E',   // verde oscuro (texto sobre claro)
  greenSoft: '#ECF4DE',   // verde muy claro (fondos)
  brown:     '#A0703F',   // café acento
  brownSoft: '#F2E8D9',   // café claro (fondos)

  // ── Texto ──
  textHi:    '#3A2A1C',   // café oscuro (títulos)
  textMed:   '#705B45',   // café medio (secundario)
  textDim:   '#A28D75',   // café muteado (sutil)

  // ── Texto sobre navbar oscuro ──
  textNav:   '#F2E8D5',
  textNavDim:'rgba(242,232,213,0.55)',

  // ── Sombras cálidas ──
  shadow:    '0 6px 24px rgba(61,40,23,0.28)',
  shadowSm:  '0 2px 10px rgba(61,40,23,0.16)',
};

// Colores semánticos de sensores (legibles sobre crema)
export const SENSOR = {
  temp:   '#E08A3C',   // naranja cálido
  hum:    '#5B9BD5',   // azul
  soil:   '#5C8A2E',   // verde
  sun:    '#E0A92E',   // dorado
  shade:  '#7B73C9',   // índigo
  cold:   '#6E86C9',   // azul frío
};
