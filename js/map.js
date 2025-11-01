// ArcGIS 3D Map Implementation with WebGL Animations
let map, view, graphicsLayer, heatmapLayer, animationLayer, buildingsLayer;
let animationEnabled = true;
let heatmapEnabled = false;
let pulseAnimationId = null;

// Initialize the 3D map when ArcGIS modules are loaded
require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/GraphicsLayer",
    "esri/layers/SceneLayer",
    "esri/layers/FeatureLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/PointSymbol3D",
    "esri/symbols/ObjectSymbol3DLayer",
    "esri/symbols/IconSymbol3DLayer",
    "esri/PopupTemplate",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "esri/widgets/Daylight",
    "esri/widgets/Weather",
    "esri/renderers/HeatmapRenderer",
    "esri/Color"
], function(
    Map, SceneView, GraphicsLayer, SceneLayer, FeatureLayer, Graphic, Point,
    PointSymbol3D, ObjectSymbol3DLayer, IconSymbol3DLayer, PopupTemplate,
    Home, Legend, Daylight, Weather, HeatmapRenderer, Color
) {

    // Create graphics layers
    graphicsLayer = new GraphicsLayer({
        title: "311 Service Requests",
        elevationInfo: {
            mode: "relative-to-ground",
            offset: 10
        }
    });

    animationLayer = new GraphicsLayer({
        title: "Animated Markers",
        elevationInfo: {
            mode: "relative-to-ground",
            offset: 0
        }
    });

    // Add NYC Buildings 3D Layer
    buildingsLayer = new SceneLayer({
        url: "https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Buildings_NewYork_17/SceneServer",
        title: "NYC Buildings",
        popupEnabled: false,
        renderer: {
            type: "simple",
            symbol: {
                type: "mesh-3d",
                symbolLayers: [{
                    type: "fill",
                    material: {
                        color: [255, 255, 255, 0.8],
                        colorMixMode: "replace"
                    },
                    edges: {
                        type: "solid",
                        color: [100, 100, 100, 0.5],
                        size: 1
                    }
                }]
            }
        }
    });

    // Create the 3D map
    map = new Map({
        basemap: "dark-gray-vector",
        ground: "world-elevation",
        layers: [buildingsLayer, animationLayer, graphicsLayer]
    });

    // Create the SceneView (3D)
    view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            position: {
                longitude: -74.0060,
                latitude: 40.7128,
                z: 50000
            },
            tilt: 45,
            heading: 0
        },
        environment: {
            lighting: {
                directShadowsEnabled: true,
                ambientOcclusionEnabled: true
            },
            atmosphere: {
                quality: "high"
            },
            starsEnabled: false
        },
        popup: {
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false
            }
        },
        constraints: {
            altitude: {
                min: 1000,
                max: 100000
            }
        }
    });

    // Add Home widget
    const homeWidget = new Home({
        view: view
    });
    view.ui.add(homeWidget, "top-left");

    // Add Daylight widget for time of day control
    const daylightWidget = new Daylight({
        view: view,
        visibleElements: {
            timezone: false,
            datePicker: false
        }
    });
    view.ui.add(daylightWidget, {
        position: "top-right",
        index: 0
    });

    // When view is ready, load initial data
    view.when(function() {
        console.log("3D Scene view is ready");
        updateMapData(filtered311Requests);
        startPulseAnimation();
        startCameraAnimation();
    });

    // Function to update map with 311 data (with 3D symbols)
    window.updateMapData = function(requests) {
        // Clear existing graphics
        graphicsLayer.removeAll();
        animationLayer.removeAll();

        if (!requests || requests.length === 0) {
            console.log("No requests to display on map");
            return;
        }

        console.log(`Displaying ${requests.length} requests on 3D map`);

        // Add graphics for each request
        requests.forEach(function(request, index) {
            if (!request.latitude || !request.longitude) return;

            // Create point geometry
            const point = new Point({
                longitude: request.longitude,
                latitude: request.latitude,
                z: 0
            });

            // 3D Symbol based on status with WebGL
            const color = getColorForStatus(request.status);
            const symbol = new PointSymbol3D({
                symbolLayers: [
                    new ObjectSymbol3DLayer({
                        width: 50,
                        height: 200,
                        depth: 50,
                        resource: { primitive: "cylinder" },
                        material: {
                            color: color,
                            transparency: 0.2
                        }
                    }),
                    new ObjectSymbol3DLayer({
                        width: 100,
                        height: 20,
                        depth: 100,
                        resource: { primitive: "sphere" },
                        material: {
                            color: color
                        },
                        anchor: "top"
                    })
                ],
                verticalOffset: {
                    screenLength: 40,
                    maxWorldLength: 200,
                    minWorldLength: 20
                },
                callout: {
                    type: "line",
                    color: color,
                    size: 2,
                    border: {
                        color: [255, 255, 255, 0.5]
                    }
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

            // Add to appropriate layer with staggered animation
            setTimeout(() => {
                graphicsLayer.add(graphic);

                // Add pulsing animation graphic
                if (animationEnabled && request.status === 'Open') {
                    addPulsingMarker(point, color);
                }
            }, index * 5); // Stagger by 5ms per marker
        });
    };

    // Add pulsing marker animation
    function addPulsingMarker(point, color) {
        const pulsingSymbol = new PointSymbol3D({
            symbolLayers: [
                new IconSymbol3DLayer({
                    size: 20,
                    resource: { primitive: "circle" },
                    material: {
                        color: [...color.slice(0, 3), 0.6]
                    },
                    outline: {
                        color: "white",
                        size: 2
                    }
                })
            ]
        });

        const graphic = new Graphic({
            geometry: point,
            symbol: pulsingSymbol
        });

        animationLayer.add(graphic);
    }

    // Pulse animation using WebGL
    let pulseScale = 0;
    let pulseDirection = 1;

    function startPulseAnimation() {
        if (pulseAnimationId) {
            cancelAnimationFrame(pulseAnimationId);
        }

        function animate() {
            if (!animationEnabled) {
                pulseAnimationId = requestAnimationFrame(animate);
                return;
            }

            pulseScale += pulseDirection * 0.02;

            if (pulseScale >= 1.5 || pulseScale <= 0) {
                pulseDirection *= -1;
            }

            // Update animation layer graphics with pulsing effect
            animationLayer.graphics.forEach((graphic, index) => {
                const originalSymbol = graphic.symbol;
                if (originalSymbol && originalSymbol.symbolLayers) {
                    const newSize = 20 + (pulseScale * 30);
                    const newSymbol = originalSymbol.clone();
                    newSymbol.symbolLayers.getItemAt(0).size = newSize;

                    // Update opacity for pulse effect
                    const opacity = 0.8 - (pulseScale * 0.4);
                    newSymbol.symbolLayers.getItemAt(0).material.color[3] = opacity;

                    graphic.symbol = newSymbol;
                }
            });

            pulseAnimationId = requestAnimationFrame(animate);
        }

        animate();
    }

    // Camera rotation animation
    let cameraAnimationId = null;
    let cameraHeading = 0;

    function startCameraAnimation() {
        function rotateCamera() {
            if (animationEnabled) {
                cameraHeading += 0.05;
                if (cameraHeading >= 360) cameraHeading = 0;

                view.goTo({
                    heading: cameraHeading
                }, {
                    animate: false
                }).catch(() => {});
            }

            cameraAnimationId = requestAnimationFrame(rotateCamera);
        }

        // Uncomment to enable auto-rotation
        // rotateCamera();
    }

    // Toggle animation
    window.toggleAnimation = function(enabled) {
        animationEnabled = enabled;
        console.log('Animation', enabled ? 'enabled' : 'disabled');

        if (enabled) {
            animationLayer.visible = true;
        } else {
            animationLayer.visible = false;
        }
    };

    // Toggle 3D buildings
    window.toggle3DBuildings = function(enabled) {
        buildingsLayer.visible = enabled;
        console.log('3D Buildings', enabled ? 'enabled' : 'disabled');
    };

    // Change basemap
    window.changeBasemap = function(basemapId) {
        map.basemap = basemapId;
    };

    // Fly to location with animation
    window.flyToBorough = function(borough) {
        const boroughCenters = {
            'MANHATTAN': { longitude: -73.9712, latitude: 40.7831, z: 15000 },
            'BROOKLYN': { longitude: -73.9442, latitude: 40.6782, z: 15000 },
            'QUEENS': { longitude: -73.7949, latitude: 40.7282, z: 15000 },
            'BRONX': { longitude: -73.8648, latitude: 40.8448, z: 15000 },
            'STATEN ISLAND': { longitude: -74.1502, latitude: 40.5795, z: 15000 },
            'ALL': { longitude: -74.0060, latitude: 40.7128, z: 50000 }
        };

        const target = boroughCenters[borough] || boroughCenters['ALL'];

        view.goTo({
            target: [target.longitude, target.latitude, target.z],
            tilt: 45,
            heading: 0
        }, {
            duration: 2000,
            easing: "ease-in-out"
        }).catch((error) => {
            console.log("Error flying to borough:", error);
        });
    };

    // Reset camera view
    window.resetCamera = function() {
        view.goTo({
            target: [-74.0060, 40.7128],
            zoom: 10,
            tilt: 45,
            heading: 0
        }, {
            duration: 2000
        });
    };

    // Helper function to get color based on status
    function getColorForStatus(status, hexFormat = false) {
        const colors = {
            'Open': hexFormat ? '#ef4444' : [239, 68, 68],
            'Closed': hexFormat ? '#22c55e' : [34, 197, 94],
            'Pending': hexFormat ? '#f59e0b' : [245, 158, 11]
        };
        return colors[status] || (hexFormat ? '#6b7280' : [107, 114, 128]);
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
});

// Show loading indicator
function showLoading() {
    $('#loadingIndicator').addClass('active');
}

// Hide loading indicator
function hideLoading() {
    $('#loadingIndicator').removeClass('active');
}
