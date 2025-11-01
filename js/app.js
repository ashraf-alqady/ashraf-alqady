// Main Application Logic
$(document).ready(function() {
    console.log('NYC 311 Dashboard initializing...');

    // Initialize the dashboard
    initializeDashboard();

    // Set up event listeners
    setupEventListeners();

    // Update dashboard with initial data
    setTimeout(function() {
        updateDashboard(filtered311Requests);
    }, 1000);
});

// Initialize dashboard
function initializeDashboard() {
    console.log('Dashboard initialized');
    updateTotalStats();
}

// Set up event listeners for filters
function setupEventListeners() {
    // Apply filters button
    $('#applyFilters').on('click', function() {
        console.log('Applying filters...');
        applyFilters();
    });

    // Reset filters button
    $('#resetFilters').on('click', function() {
        console.log('Resetting filters...');
        resetFilters();
    });

    // Enter key on selects
    $('.filter-select').on('keypress', function(e) {
        if (e.which === 13) {
            applyFilters();
        }
    });

    // Real-time filtering on change (optional - can be enabled)
    /*
    $('.filter-select').on('change', function() {
        applyFilters();
    });
    */
}

// Apply filters to data
function applyFilters() {
    showLoading();

    const dateRange = parseInt($('#dateRange').val());
    const borough = $('#borough').val();
    const status = $('#status').val();
    const complaintType = $('#complaintType').val();

    console.log('Filters:', { dateRange, borough, status, complaintType });

    // Start with all requests
    let filtered = [...all311Requests];

    // Filter by date range
    if (dateRange) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - dateRange);

        filtered = filtered.filter(request => {
            return new Date(request.createdDate) >= cutoffDate;
        });
    }

    // Filter by borough
    if (borough !== 'all') {
        filtered = filtered.filter(request => request.borough === borough);
    }

    // Filter by status
    if (status !== 'all') {
        filtered = filtered.filter(request => request.status === status);
    }

    // Filter by complaint type
    if (complaintType !== 'all') {
        filtered = filtered.filter(request => request.complaintType === complaintType);
    }

    console.log(`Filtered from ${all311Requests.length} to ${filtered.length} requests`);

    // Update global filtered data
    filtered311Requests = filtered;

    // Update dashboard
    updateDashboard(filtered311Requests);

    setTimeout(hideLoading, 500);
}

// Reset all filters
function resetFilters() {
    $('#dateRange').val('30');
    $('#borough').val('all');
    $('#status').val('all');
    $('#complaintType').val('all');

    // Reset to all data
    filtered311Requests = [...all311Requests];

    // Update dashboard
    updateDashboard(filtered311Requests);
}

// Update entire dashboard
function updateDashboard(data) {
    console.log(`Updating dashboard with ${data.length} requests`);

    // Update stats
    updateStats(data);

    // Update charts
    if (typeof updateAllCharts === 'function') {
        updateAllCharts(data);
    }

    // Update map
    if (typeof updateMapData === 'function') {
        updateMapData(data);
    }
}

// Update statistics in header and sidebar
function updateStats(data) {
    // Total requests
    $('#totalRequests').text(data.length.toLocaleString());

    // Count by status
    const statusCounts = {
        'Open': 0,
        'Closed': 0,
        'Pending': 0
    };

    data.forEach(request => {
        if (statusCounts.hasOwnProperty(request.status)) {
            statusCounts[request.status]++;
        }
    });

    $('#openRequests').text(statusCounts.Open.toLocaleString());
    $('#closedRequests').text(statusCounts.Closed.toLocaleString());
}

// Update total stats (initial load)
function updateTotalStats() {
    if (all311Requests && all311Requests.length > 0) {
        $('#totalRequests').text(all311Requests.length.toLocaleString());
    }
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility function to format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export data function (future enhancement)
function exportData(format) {
    console.log(`Exporting data in ${format} format...`);
    // Implementation for CSV/Excel export
    if (format === 'csv') {
        exportToCSV();
    } else if (format === 'json') {
        exportToJSON();
    }
}

// Export to CSV
function exportToCSV() {
    const headers = ['Unique Key', 'Created Date', 'Closed Date', 'Agency', 'Complaint Type',
                     'Descriptor', 'Borough', 'Status', 'Address', 'Latitude', 'Longitude'];

    let csv = headers.join(',') + '\n';

    filtered311Requests.forEach(request => {
        const row = [
            request.uniqueKey,
            formatDateTime(request.createdDate),
            request.closedDate ? formatDateTime(request.closedDate) : '',
            request.agency,
            request.complaintType,
            request.descriptor,
            request.borough,
            request.status,
            `"${request.address}"`,
            request.latitude,
            request.longitude
        ];
        csv += row.join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyc311_data_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Export to JSON
function exportToJSON() {
    const json = JSON.stringify(filtered311Requests, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyc311_data_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Keyboard shortcuts
$(document).on('keydown', function(e) {
    // Ctrl/Cmd + F: Focus on filters
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        $('#dateRange').focus();
    }

    // Ctrl/Cmd + R: Reset filters
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetFilters();
    }
});

// Handle window resize
$(window).on('resize', function() {
    // Charts will auto-resize due to responsive:true option
    console.log('Window resized');
});

// Loading indicator helpers (defined here for app.js context)
if (typeof showLoading === 'undefined') {
    window.showLoading = function() {
        $('#loadingIndicator').addClass('active');
    };
}

if (typeof hideLoading === 'undefined') {
    window.hideLoading = function() {
        $('#loadingIndicator').removeClass('active');
    };
}

console.log('App.js loaded successfully');
