

mapboxgl.accessToken = 'pk.eyJ1IjoibWFnZ2llLWRhdmllcyIsImEiOiJjbW5pMnkzNWowOTlkMnFwazhna2ZvZGdtIn0.sOizRPdTjcNQ5rsDklJd2Q';
const map = new mapboxgl.Map({
    container: 'map-container', // container ID
    style: 'mapbox://styles/mapbox/standard-satellite',
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
    center: [-74.04729, 40.70191], // starting position [lng, lat].
    zoom: 10 // starting zoom
    //Note: add bounding box//
});
