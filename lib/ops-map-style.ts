import type { StyleSpecification } from "maplibre-gl"
import type { Map as MapLibreMap } from "maplibre-gl"

/**
 * Dark raster basemap — no API key, no country-name layer.
 * Shared by homepage Ops Console and Capacity Map.
 */
export function darkOpsStyle(): StyleSpecification {
  return {
    version: 8,
    name: "gryps-ops-dark",
    sources: {
      "carto-dark": {
        type: "raster",
        tiles: [
          "https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxzoom: 19,
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#0B1220" },
      },
      {
        id: "carto-dark",
        type: "raster",
        source: "carto-dark",
        paint: {
          "raster-opacity": 0.95,
          "raster-saturation": -0.15,
        },
      },
    ],
  }
}

function parallelLine(lat: number, fromLng: number, toLng: number, step = 2): GeoJSON.Feature {
  const coords: [number, number][] = []
  for (let lng = fromLng; lng <= toLng; lng += step) coords.push([lng, lat])
  return {
    type: "Feature",
    properties: { lat },
    geometry: { type: "LineString", coordinates: coords },
  }
}

function arcticGlowPolygon(): GeoJSON.Feature {
  const coords: [number, number][] = []
  for (let lng = -30; lng <= 40; lng += 2) coords.push([lng, 66.5])
  for (let lng = 40; lng >= -30; lng -= 2) coords.push([lng, 82])
  coords.push([-30, 66.5])
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  }
}

function orbitalArcs(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { class: "LEO", color: "#4FA8FF" },
        geometry: {
          type: "LineString",
          coordinates: [[-25, 62], [-10, 72], [5, 78], [20, 76], [35, 70]],
        },
      },
      {
        type: "Feature",
        properties: { class: "MEO", color: "#6EE7F9" },
        geometry: {
          type: "LineString",
          coordinates: [[-28, 58], [-5, 68], [12, 74], [30, 72]],
        },
      },
      {
        type: "Feature",
        properties: { class: "GEO", color: "#D97706" },
        geometry: {
          type: "LineString",
          coordinates: [[-20, 55], [0, 58], [20, 57], [38, 54]],
        },
      },
    ],
  }
}

/** Arctic glow, 60/70°N graticule, animated LEO/MEO/GEO arcs. Returns interval id for cleanup. */
export function addOpsDecorLayers(map: MapLibreMap): number {
  if (!map.getSource("arctic-glow")) {
    map.addSource("arctic-glow", {
      type: "geojson",
      data: { type: "FeatureCollection", features: [arcticGlowPolygon()] },
    })
    map.addLayer({
      id: "arctic-glow-fill",
      type: "fill",
      source: "arctic-glow",
      paint: { "fill-color": "#6EE7F9", "fill-opacity": 0.06 },
    })
  }

  if (!map.getSource("graticule")) {
    map.addSource("graticule", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          parallelLine(60, -30, 40),
          parallelLine(70, -30, 40),
          parallelLine(66.5, -30, 40),
        ],
      },
    })
    map.addLayer({
      id: "graticule-lines",
      type: "line",
      source: "graticule",
      paint: {
        "line-color": "#4FA8FF",
        "line-opacity": 0.35,
        "line-width": 1,
        "line-dasharray": [2, 2],
      },
    })
  }

  if (!map.getSource("orbits")) {
    map.addSource("orbits", { type: "geojson", data: orbitalArcs() })
    map.addLayer({
      id: "orbit-arcs",
      type: "line",
      source: "orbits",
      paint: {
        "line-color": ["get", "color"],
        "line-width": 1.5,
        "line-opacity": 0.75,
        "line-dasharray": [0, 4, 3],
      },
    })
  }

  const dashSeq = [
    [0, 4, 3],
    [1, 4, 2],
    [2, 4, 1],
    [3, 4, 0],
    [0, 1, 3, 4],
    [0, 2, 3, 3],
    [0, 3, 3, 2],
    [0, 4, 3, 1],
  ]
  let step = 0
  return window.setInterval(() => {
    step = (step + 1) % dashSeq.length
    if (map.getLayer("orbit-arcs")) {
      map.setPaintProperty("orbit-arcs", "line-dasharray", dashSeq[step])
    }
  }, 80)
}

export const OPS_MAP_CSS = `
  .gryps-ops-popup .maplibregl-popup-content {
    background: #0B1220;
    border: 1px solid #1E293B;
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.45);
    padding: 12px 14px;
    color: #F7FAFC;
  }
  .gryps-ops-popup .maplibregl-popup-tip { border-top-color: #0B1220; }
  .gryps-ops-popup .maplibregl-popup-close-button {
    color: #64748B; font-size: 18px; padding: 4px 8px;
  }
  .maplibregl-ctrl-attrib {
    font-size: 9px; background: rgba(7,11,18,0.7) !important; color: #64748B !important;
  }
`
