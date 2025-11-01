// Chart.js Implementation for Dashboard Charts
let complaintTypesChart, statusChart, timelineChart, boroughChart;

// Chart color schemes
const chartColors = {
    primary: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
    status: {
        'Open': '#ef4444',
        'Closed': '#22c55e',
        'Pending': '#f59e0b'
    }
};

// Initialize all charts
function initializeCharts() {
    initComplaintTypesChart();
    initStatusChart();
    initTimelineChart();
    initBoroughChart();
}

// Update all charts with filtered data
function updateAllCharts(data) {
    updateComplaintTypesChart(data);
    updateStatusChart(data);
    updateTimelineChart(data);
    updateBoroughChart(data);
}

// 1. Complaint Types Chart (Horizontal Bar)
function initComplaintTypesChart() {
    const ctx = document.getElementById('complaintTypesChart').getContext('2d');
    complaintTypesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Number of Requests',
                data: [],
                backgroundColor: chartColors.primary[0],
                borderColor: chartColors.primary[0],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Requests: ' + context.parsed.x;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function updateComplaintTypesChart(data) {
    // Count requests by complaint type
    const typeCounts = {};
    data.forEach(request => {
        typeCounts[request.complaintType] = (typeCounts[request.complaintType] || 0) + 1;
    });

    // Sort by count and take top 10
    const sorted = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    complaintTypesChart.data.labels = sorted.map(item => item[0]);
    complaintTypesChart.data.datasets[0].data = sorted.map(item => item[1]);
    complaintTypesChart.update();
}

// 2. Status Chart (Doughnut)
function initStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Open', 'Closed', 'Pending'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    chartColors.status.Open,
                    chartColors.status.Closed,
                    chartColors.status.Pending
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateStatusChart(data) {
    const statusCounts = { 'Open': 0, 'Closed': 0, 'Pending': 0 };
    data.forEach(request => {
        if (statusCounts.hasOwnProperty(request.status)) {
            statusCounts[request.status]++;
        }
    });

    statusChart.data.datasets[0].data = [
        statusCounts.Open,
        statusCounts.Closed,
        statusCounts.Pending
    ];
    statusChart.update();

    // Update header stats
    $('#openRequests').text(statusCounts.Open.toLocaleString());
    $('#closedRequests').text(statusCounts.Closed.toLocaleString());
}

// 3. Timeline Chart (Line)
function initTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Requests Created',
                data: [],
                borderColor: chartColors.primary[0],
                backgroundColor: chartColors.primary[0] + '20',
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: 'Number of Requests'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function updateTimelineChart(data) {
    // Group requests by date
    const dateCounts = {};
    data.forEach(request => {
        const date = new Date(request.createdDate);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
    });

    // Sort by date
    const sortedDates = Object.entries(dateCounts)
        .sort((a, b) => {
            const dateA = new Date(a[0] + ', 2024');
            const dateB = new Date(b[0] + ', 2024');
            return dateA - dateB;
        });

    timelineChart.data.labels = sortedDates.map(item => item[0]);
    timelineChart.data.datasets[0].data = sortedDates.map(item => item[1]);
    timelineChart.update();
}

// 4. Borough Chart (Bar)
function initBoroughChart() {
    const ctx = document.getElementById('boroughChart').getContext('2d');
    boroughChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
            datasets: [{
                label: 'Number of Requests',
                data: [0, 0, 0, 0, 0],
                backgroundColor: chartColors.primary.slice(0, 5),
                borderColor: chartColors.primary.slice(0, 5),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Requests: ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function updateBoroughChart(data) {
    const boroughCounts = {
        'MANHATTAN': 0,
        'BROOKLYN': 0,
        'QUEENS': 0,
        'BRONX': 0,
        'STATEN ISLAND': 0
    };

    data.forEach(request => {
        if (boroughCounts.hasOwnProperty(request.borough)) {
            boroughCounts[request.borough]++;
        }
    });

    boroughChart.data.datasets[0].data = [
        boroughCounts.MANHATTAN,
        boroughCounts.BROOKLYN,
        boroughCounts.QUEENS,
        boroughCounts.BRONX,
        boroughCounts['STATEN ISLAND']
    ];
    boroughChart.update();
}

// Initialize charts when document is ready
$(document).ready(function() {
    // Wait a bit for Chart.js to be ready
    setTimeout(function() {
        console.log('Initializing charts...');
        initializeCharts();
        // Update with initial data
        if (filtered311Requests && filtered311Requests.length > 0) {
            updateAllCharts(filtered311Requests);
        }
    }, 500);
});
