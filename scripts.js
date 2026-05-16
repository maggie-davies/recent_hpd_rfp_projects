

mapboxgl.accessToken = 'pk.eyJ1IjoibWFnZ2llLWRhdmllcyIsImEiOiJjbW5pMnkzNWowOTlkMnFwazhna2ZvZGdtIn0.sOizRPdTjcNQ5rsDklJd2Q';
const map = new mapboxgl.Map({
    container: 'map-container', // container ID
    style: 'mapbox://styles/mapbox/standard',
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
    zoom: 10.2 // starting zoom
    
});

console.log(hpd_rfpData); // check if project data are loading correctly

map.on('load',() => {

    map.addSource ('hpd_rfp', {
        type: 'geojson',
        data: hpd_rfpData
    });

    map.addLayer({
        id: 'projectlocations',
        type: 'circle',
        source: 'hpd_rfp',
        paint: {
            'circle-radius': 4, 
            'circle-color': '#f5ad42',
        }
    });

});