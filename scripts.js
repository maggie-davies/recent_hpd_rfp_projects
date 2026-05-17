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
    center: [-73.98327, 40.74664], // starting position [lng, lat].
    zoom: 10.2, // starting zoom
    maxBounds: [[-74.25909, 40.477399], [-73.700272, 40.917577]] // restrict the map from zooming out or panning beyond the NYC metro area
});

console.log(hpd_rfpData); // check if project data are loading correctly

map.on('load', () => {
    // add project data as a new source to the map, with the source type set to geojson and the data set to the hpd_rfpData variable defined in hpd_rfp.js
    map.addSource('hpd_rfp', {
        type: 'geojson',
        data: hpd_rfpData
    });

    // add a new layer to visualize HPD RFP project locations as circles
    map.addLayer({
        id: 'projectlocations',
        type: 'circle',
        source: 'hpd_rfp',
        paint: {
            'circle-radius': 5.5,
            'circle-color': [
                'match',
                ['downcase', ['get', 'status']],
                'under review', '#d08f2b',
                'designated', '#264653',
                '#413201'
            ],
            'circle-stroke-color': 'rgba(255,255,255,0.85)',
            'circle-stroke-width': 1.5
        }
    });

    // add pill toggles to filter the map view by projects that are under review vs. designated
    const statusMapKey = {
        'under review': 'underReview',
        designated: 'designated'
    };
    const statusFilters = {
        underReview: true,
        designated: true
    };
    function updateProjectLocationFilter() {
        const activeFilters = [];
        if (statusFilters.underReview) {
            activeFilters.push(['==', ['downcase', ['get', 'status']], 'under review']);
        }
        if (statusFilters.designated) {
            activeFilters.push(['==', ['downcase', ['get', 'status']], 'designated']);
        }

        if (!activeFilters.length) {
            map.setLayoutProperty('projectlocations', 'visibility', 'none');
            return;
        }
        map.setLayoutProperty('projectlocations', 'visibility', 'visible');
        const filterExpression = activeFilters.length === 1 ? activeFilters[0] : ['any', ...activeFilters];
        map.setFilter('projectlocations', filterExpression);
    }
    function updatePillState(status, enabled) {
        const pill = document.querySelector(`[data-status="${status}"]`);
        if (!pill) return;
        pill.classList.toggle('active', enabled);
        pill.classList.toggle('inactive', !enabled);
    }
    document.querySelectorAll('.status-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
            const status = pill.dataset.status;
            const key = statusMapKey[status];
            statusFilters[key] = !statusFilters[key];
            updatePillState(status, statusFilters[key]);
            updateProjectLocationFilter();
        });
    });
    updateProjectLocationFilter();

    // Create popup UI instances for hover and click actions, but don't add them to the map yet.
    const hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    const clickPopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false
    });
    // creating a default setting that the click popup is closed to enable control of the click and hover popups so that they don't conflict with each other
    let clickPopupOpen = false; 

    // create a function to generate an image gallery element for the click popup, enabling users to click through multiple images if they are available
    function createImageGallery(properties) {
        const imageKeys = ['img2', 'img3', 'img4', 'img1'];
        const imageUrls = imageKeys
            .map((key) => properties[key])
            .filter((url) => url && url.trim());

        if (!imageUrls.length) {
            return null;
        }

        const gallery = document.createElement('div');
        gallery.style.position = 'relative';
        gallery.style.marginTop = '10px';

        const imgEl = document.createElement('img');
        imgEl.style.width = '100%';
        imgEl.style.height = 'auto';
        imgEl.style.borderRadius = '4px';
        imgEl.style.display = 'block';
        imgEl.alt = 'Project Image';
        gallery.appendChild(imgEl);

        const arrowStyle = {
            position: 'absolute',
            top: '50%',
            width: '32px',
            height: '32px',
            marginTop: '-16px',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.85)',
            color: '#333',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
        };

        //adding buttons for users to click through images in the image gallery that appears in the click pop-up.
        //and positioning the buttons on the left and right sides of the gallery, with arrows to indicate their function.
        // The buttons are also disabled and styled with reduced opacity when the user is at the beginning or end of the image list.
        const prevButton = document.createElement('button');
        prevButton.type = 'button';
        prevButton.textContent = '‹';
        Object.assign(prevButton.style, arrowStyle);
        prevButton.style.left = '8px';

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.textContent = '›';
        Object.assign(nextButton.style, arrowStyle);
        nextButton.style.right = '8px';

        gallery.appendChild(prevButton);
        gallery.appendChild(nextButton);

        let currentIndex = 0;
        function updateGallery() {
            imgEl.src = imageUrls[currentIndex];
            prevButton.disabled = currentIndex === 0;
            nextButton.disabled = currentIndex === imageUrls.length - 1;
            prevButton.style.opacity = currentIndex === 0 ? '0.4' : '1';
            nextButton.style.opacity = currentIndex === imageUrls.length - 1 ? '0.4' : '1';
            prevButton.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
            nextButton.style.cursor = currentIndex === imageUrls.length - 1 ? 'not-allowed' : 'pointer';
        }

        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex -= 1;
                updateGallery();
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentIndex < imageUrls.length - 1) {
                currentIndex += 1;
                updateGallery();
            }
        });

        updateGallery();
        return gallery;
    }

    //formatting a pop-up with different, simpler information if the project is still under review since it won't have the same information vs. after it's designated.
    //Also removes any properties that are empty or undefined to avoid showing empty fields in the pop-up description.
    function buildPopupLine(label, value) {
        if (value === undefined || value === null) return '';
        const trimmed = String(value).trim();
        if (!trimmed) return '';
        return '<br><strong>' + label + '</strong> ' + trimmed;
    }

    function getClickDescription(properties) {
        if (properties.status && properties.status.toLowerCase() === 'under review') {
            let description = buildPopupLine('RFP Submission Date:', properties.submission);
            description += '<br><br><a href="' + properties.website + '" target="_blank" title="Project Website">Take me to the project website</a>';
            return description;
        }

        let description = '';
        description += buildPopupLine('Status:', properties.status + (properties.designation ? ' | ' + properties.designation : ''));
        description += buildPopupLine('Site Type:', properties.site_type);
        description += buildPopupLine('Proposed Housing Units:', properties.units);
        description += buildPopupLine('Development Team:', properties.development_team);
        description += buildPopupLine('Architect:', properties.architect);
        description += buildPopupLine('Proposed Community Facilities:', properties.community_facilities);
        description += buildPopupLine('Residential Amenities:', properties.amenities);
        description += '<br><br><a href="' + properties.website + '" target="_blank" title="Project Website">Take me to the project website</a>';
        return description;
    }

    map.on('mouseenter', 'projectlocations', (e) => {
        if (clickPopupOpen) return;
        map.getCanvas().style.cursor = 'pointer';
        const coordinates_hover = e.features[0].geometry.coordinates.slice();
        const description_hover =
            'Click to explore' + '<br>' + '<strong>' + e.features[0].properties.hpd_rfp + '</strong>' +
            '<br>' + '<img src="' + e.features[0].properties.img1 + '" alt="Project Image" style="width:100%; height:auto; margin-top:5px;">';
        hoverPopup.setLngLat(coordinates_hover).setHTML(description_hover).addTo(map);
    });

    map.on('mouseleave', 'projectlocations', () => {
        if (clickPopupOpen) return;
        map.getCanvas().style.cursor = '';
        hoverPopup.remove();
    });

    map.on('click', 'projectlocations', (e) => {
        // when the click popup is open, disable hover popups until the click popup is closed
        clickPopupOpen = true;
        hoverPopup.remove();
        // construct the description content for the click popup
        const coordinates_click = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;
        const description_click = getClickDescription(properties);

        // create and style a title for the click popup, and add this, the image gallery, and the description content to the click popup
        const popupContent = document.createElement('div');
        const titleDiv = document.createElement('div');
        titleDiv.innerHTML = '<strong>' + properties.project_name + '</strong>';
        titleDiv.style.fontSize = '16px';
        titleDiv.style.fontWeight = '700';
        titleDiv.style.marginBottom = '8px';
        titleDiv.style.paddingBottom = '4px';
        titleDiv.style.borderBottom = '1px solid rgba(0,0,0,0.12)';
        popupContent.appendChild(titleDiv);

        const gallery = createImageGallery(properties);
        if (gallery) {
            popupContent.appendChild(gallery);
        }

        const descriptionDiv = document.createElement('div');
        descriptionDiv.innerHTML = description_click;
        descriptionDiv.style.marginTop = '10px';
        popupContent.appendChild(descriptionDiv);

        clickPopup.setLngLat(coordinates_click).setDOMContent(popupContent).addTo(map); // add the click popup to the map at the location of the clicked marker
    });

    // when the click popup is closed, reset the clickPopupOpen variable to false to allow hover popups to be shown again
    clickPopup.on('close', () => {
        clickPopupOpen = false;
    });
});