# NYC 311 Service Requests Dashboard

A comprehensive web-based dashboard for visualizing and analyzing NYC 311 service requests, built with vanilla JavaScript, jQuery, HTML, CSS, and ArcGIS API 4.

## Features

### Interactive Map
- **ArcGIS API 4** powered map showing all 311 service requests across NYC
- Color-coded markers based on request status (Open, Closed, Pending)
- Interactive popups with detailed request information
- Click on any marker to view full details including:
  - Complaint type and descriptor
  - Borough and address
  - Agency responsible
  - Creation and closure dates
  - Resolution description

### Dynamic Charts
- **Top Complaint Types** - Horizontal bar chart showing the most common complaint types
- **Status Distribution** - Doughnut chart displaying the breakdown of Open, Closed, and Pending requests
- **Requests Over Time** - Line chart tracking daily request volumes
- **Requests by Borough** - Bar chart comparing request volumes across all five boroughs

### Powerful Filtering
- **Date Range** - Filter by 7 days, 30 days, 90 days, or last year
- **Borough** - Filter by Manhattan, Brooklyn, Queens, Bronx, or Staten Island
- **Status** - Filter by Open, Closed, or Pending requests
- **Complaint Type** - Filter by specific complaint categories
- Real-time dashboard updates when filters are applied

### Statistics Dashboard
- Total request count
- Open requests count
- Closed requests count
- All stats update dynamically based on applied filters

## Technology Stack

- **HTML5** - Structure and layout
- **CSS3** - Modern styling with gradients, flexbox, and responsive design
- **Vanilla JavaScript** - Core application logic
- **jQuery 3.7.1** - DOM manipulation and event handling
- **ArcGIS API for JavaScript 4.28** - Interactive mapping and geospatial visualization
- **Chart.js 4.4.0** - Beautiful, responsive charts and graphs

## Project Structure

```
nyc-311-dashboard/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling and responsive design
├── js/
│   ├── data.js             # Sample NYC 311 data generator
│   ├── map.js              # ArcGIS map implementation
│   ├── charts.js           # Chart.js chart implementations
│   └── app.js              # Main application logic and filters
└── README.md               # This file
```

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional but recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nyc-311-dashboard
```

2. Open the dashboard:

**Option A: Using a local web server (recommended)**
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

**Option B: Direct file access**
Simply open `index.html` in your web browser. Note: Some features may not work properly due to CORS restrictions.

## Usage

### Viewing the Dashboard
1. Open the dashboard in your browser
2. Wait for the map and data to load (approximately 1-2 seconds)
3. The dashboard displays 500 sample NYC 311 service requests by default

### Filtering Data
1. Use the sidebar filters to narrow down the data:
   - Select a date range
   - Choose a specific borough
   - Filter by status
   - Select a complaint type
2. Click "Apply Filters" to update the dashboard
3. Click "Reset" to clear all filters and show all data

### Exploring the Map
- Zoom in/out using the mouse wheel or zoom controls
- Pan by clicking and dragging
- Click on any marker to view request details in a popup
- Use the Home button (top-left) to reset the map view

### Analyzing Charts
- Hover over chart elements to see detailed tooltips
- All charts update automatically when filters are applied
- Charts are fully responsive and adapt to screen size

## Data

The dashboard uses generated sample data that mimics real NYC 311 service requests. The data includes:

- **500 sample requests** across all five boroughs
- **10 common complaint types**: Noise, Heat/Hot Water, Street Condition, Illegal Parking, Water System, Homeless, Damaged Tree, Graffiti, Street Light, Blocked Driveway
- **Random dates** within the last 30 days
- **Geographic coordinates** spread across NYC boroughs
- **Agency assignments** based on complaint type
- **Status values**: Open, Closed, or Pending

### Connecting to Real Data

To connect to the real NYC Open Data API, modify `js/data.js`:

```javascript
// Replace the generateSampleData function with:
async function fetchRealNYC311Data() {
    const response = await fetch('https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit=1000');
    const data = await response.json();
    return data;
}
```

## Keyboard Shortcuts

- **Ctrl/Cmd + F** - Focus on filters
- **Ctrl/Cmd + R** - Reset all filters

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers (1920px+)
- Laptops (1200px - 1919px)
- Tablets (768px - 1199px)
- Mobile devices (< 768px)

## Performance

- Handles 500+ data points efficiently
- Optimized chart rendering
- Lazy loading for map markers
- Smooth animations and transitions

## Future Enhancements

- [ ] Real-time data connection to NYC Open Data API
- [ ] Data export to CSV/Excel (partially implemented)
- [ ] Advanced search functionality
- [ ] Heat map visualization
- [ ] Clustering for large datasets
- [ ] User authentication and saved filters
- [ ] Historical data comparison
- [ ] Predictive analytics

## License

This project is open source and available under the MIT License.

## Credits

- **NYC Open Data** - Data source inspiration
- **Esri** - ArcGIS API for JavaScript
- **Chart.js** - Beautiful charts library
- **jQuery** - JavaScript library

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

Built with ❤️ for NYC
