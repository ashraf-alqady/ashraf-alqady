// ArcGIS Map Implementation
let map, view, graphicsLayer;

// Initialize the map when ArcGIS modules are loaded
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/PopupTemplate",
    "esri/widgets/Home",
    "esri/widgets/Zoom",
    "esri/widgets/ScaleBar",
    "esri/widgets/Legend",
    "esri/geometry/support/webMercatorUtils"
], function(
    Map, MapView, GraphicsLayer, Graphic, Point,
    SimpleMarkerSymbol, PopupTemplate, Home, Zoom, ScaleBar, Legend, webMercatorUtils
) {

    // Create graphics layer for 311 requests
    graphicsLayer = new GraphicsLayer({
        title: "311 Service Requests"
    });

    // Create the map
    map = new Map({
        basemap: "streets-navigation-vector",
        layers: [graphicsLayer]
    });

    // Create the MapView
    view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-73.9712, 40.7831], // NYC center
        zoom: 11,
        popup: {
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false
            }
        }
    });

    // Add Home widget
    const homeWidget = new Home({
        view: view
    });
    view.ui.add(homeWidget, "top-left");

    // Add ScaleBar widget
    const scaleBar = new ScaleBar({
        view: view,
        unit: "dual"
    });
    view.ui.add(scaleBar, "bottom-left");

    // When view is ready, load initial data
    view.when(function() {
        console.log("Map view is ready");
        updateMapData(filtered311Requests);
    });

    // Function to update map with 311 data
    window.updateMapData = function(requests) {
        // Clear existing graphics
        graphicsLayer.removeAll();

        if (!requests || requests.length === 0) {
            console.log("No requests to display on map");
            return;
        }

        console.log(`Displaying ${requests.length} requests on map`);

        // Add graphics for each request
        requests.forEach(function(request) {
            if (!request.latitude || !request.longitude) return;

            // Create point geometry
            const point = new Point({
                longitude: request.longitude,
                latitude: request.latitude
            });

            // Symbol based on status
            const symbol = new SimpleMarkerSymbol({
                style: "circle",
                color: getColorForStatus(request.status),
                size: "10px",
                outline: {
                    color: [255, 255, 255],
                    width: 2
                }
            });

            // Popup template
            const popupTemplate = new PopupTemplate({
                title: "{complaintType}",
                content: `
                    <div style="font-size: 14px;">
                        <p><strong>Status:</strong> <span style="color: ${getColorForStatus(request.status, true)}; font-weight: bold;">{status}</span></p>
                        <p><strong>Borough:</strong> {borough}</p>
                        <p><strong>Address:</strong> {address}</p>
                        <p><strong>Agency:</strong> {agency}</p>
                        <p><strong>Descriptor:</strong> {descriptor}</p>
                        <p><strong>Created:</strong> {createdDate}</p>
                        ${request.closedDate ? '<p><strong>Closed:</strong> {closedDate}</p>' : ''}
                        ${request.resolutionDescription ? '<p><strong>Resolution:</strong> {resolutionDescription}</p>' : ''}
                    </div>
                `
            });

            // Create graphic
            const graphic = new Graphic({
                geometry: point,
                symbol: symbol,
                attributes: {
                    uniqueKey: request.uniqueKey,
                    complaintType: request.complaintType,
                    status: request.status,
                    borough: request.borough,
                    address: request.address,
                    agency: request.agency,
                    descriptor: request.descriptor,
                    createdDate: formatDate(request.createdDate),
                    closedDate: request.closedDate ? formatDate(request.closedDate) : null,
                    resolutionDescription: request.resolutionDescription
                },
                popupTemplate: popupTemplate
            });

            graphicsLayer.add(graphic);
        });

        // Update map extent to show all points (with some requests)
        if (requests.length > 0 && requests.length < 100) {
            setTimeout(function() {
                view.goTo(graphicsLayer.graphics, {
                    duration: 1000
                }).catch(function(error) {
                    console.log("Error zooming to graphics:", error);
                });
            }, 500);
        }
    };

    // Helper function to get color based on status
    function getColorForStatus(status, hexFormat = false) {
        const colors = {
            'Open': hexFormat ? '#ef4444' : [239, 68, 68, 0.8],
            'Closed': hexFormat ? '#22c55e' : [34, 197, 94, 0.8],
            'Pending': hexFormat ? '#f59e0b' : [245, 158, 11, 0.8]
        };
        return colors[status] || (hexFormat ? '#6b7280' : [107, 114, 128, 0.8]);
    }

    // Helper function to format date
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Cluster visualization for many points
    window.enableClustering = function() {
        // Future enhancement: Add clustering for better performance with many points
        console.log("Clustering feature - to be implemented");
    };
});

// Show loading indicator
function showLoading() {
    $('#loadingIndicator').addClass('active');
}

// Hide loading indicator
function hideLoading() {
    $('#loadingIndicator').removeClass('active');
}
