
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
    center: [-73.98327, 40.74664], // starting position [lng, lat].
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
            'circle-radius': 4.5,
            'circle-color': '#413201',
        }
    });

    // Create a popup UI for a 'hover' action, but don't add it to the map yet.
    // I only want the UI to appear once the cursor is hovering over an element.
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    map.addInteraction('projects-mouseenter-interaction', {
        type: 'mouseenter',
        target: { layerId: 'projectlocations' },
        handler: (e) => {
            map.getCanvas().style.cursor = 'pointer';
            // Copy the coordinates from the POI underneath the cursor
            const coordinates_hover = e.feature.geometry.coordinates.slice();
            const description_hover = e.feature.properties.description;

            // Populate the popup and set its coordinates based on the feature found.
            popup.setLngLat(coordinates_hover).setHTML(description_hover).addTo(map);
        }
    });
    map.addInteraction('projects-mouseleave-interaction', {
        type: 'mouseleave',
        target: { layerId: 'projectlocations' },
        handler: () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        }
    });

   // When a click event occurs on a feature in the projectlocations layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.addInteraction('projects-click-interaction', {
            type: 'click',
            target: { layerId: 'projectlocations' },
            handler: (e) => {
                // Copy coordinates array.
                const coordinates_click = e.feature.geometry.coordinates.slice();
                const description_click = e.feature.properties.project_name + ": " + "<br>" + e.feature.properties.status + " | " + e.feature.properties.site_type + "<br>" + e.feature.properties.units + "<br>" + e.feature.properties.community_facilities + "<br>" + e.feature.properties.amenities + "<br>"+ e.feature.properties.development_team + " | " + e.feature.properties.architect + "<br>" + e.feature.properties.website;
                // add an image to the popup if the project has an image URL in its properties
                if (e.feature.properties.img1) {
                    description_click += "<br><img src='" + e.feature.properties.img1 + "' alt='Project Image' style='width:100%; height:auto; margin-top:5px;'>";
                }
                // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed to.

                new mapboxgl.Popup()
                    .setLngLat(coordinates_click)
                    .setHTML(description_click)
                    .addTo(map);
            }
        });
});