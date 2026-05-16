
//add mapboxgl access token and initialize map centered on New York City
mapboxgl.accessToken = 'pk.eyJ1IjoibWFnZ2llLWRhdmllcyIsImEiOiJjbW5pMnkzNWowOTlkMnFwazhna2ZvZGdtIn0.sOizRPdTjcNQ5rsDklJd2Q';
const map = new mapboxgl.Map({
    container: 'map-container', // container ID
    style: 'mapbox://styles/mapbox/standard', // apply Mapbox standard style
    //configure the basemap style without points of interest or roads 
    config: {
        basemap: {
            showPedestrianRoads: false,
            backgroundPointOfInterestLabels: "none",
            showRoadLabels: false,
            showTransitLabels: false,
            showAdminBoundaries: false,
            showRoadsAndTransit: false
        }
    },
    //attempted to add code bounding the map zoom: didn't work
    // bounds: [[-74.25909, 40.477399], [-73.700272, 40.917577]], //New York City bounds [west, south, east, north] 
    center: [-74.04729, 40.70191], // starting position [lng, lat].
    zoom: 10.2 // starting zoom

});

console.log(hpd_rfpData); // check if project data are loading correctly

map.on('load', () => {
    map.addSource('hpd_rfp', {
        type: 'geojson',
        data: hpd_rfpData
    });

    map.addLayer({
        id: 'projectlocations',
        type: 'circle',
        source: 'hpd_rfp',
        paint: {
            'circle-radius': 4,
            'circle-color': '#2c0141',
        }
    });

    // Create a popup UI for a 'hover' action, but don't add it to the map yet.
    // I only want the UI to appear once the cursor is hovering over an element.
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    map.addInteraction('places-mouseenter-interaction', {
        type: 'mouseenter',
        target: { layerId: 'projectlocations' },
        handler: (e) => {
            map.getCanvas().style.cursor = 'pointer';
            // Copy the coordinates from the POI underneath the cursor
            const coordinates = e.feature.geometry.coordinates.slice();
            const description = e.feature.properties.description;

            // Populate the popup and set its coordinates based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
        }
    });
    map.addInteraction('places-mouseleave-interaction', {
        type: 'mouseleave',
        target: { layerId: 'projectlocations' },
        handler: () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        }
    });
});