// NYC311 Sample Data Generator
const NYC311Data = {
    // Sample complaint types
    complaintTypes: [
        'Noise',
        'Heat/Hot Water',
        'Street Condition',
        'Illegal Parking',
        'Water System',
        'Homeless',
        'Damaged Tree',
        'Graffiti',
        'Street Light',
        'Blocked Driveway'
    ],

    boroughs: ['MANHATTAN', 'BROOKLYN', 'QUEENS', 'BRONX', 'STATEN ISLAND'],

    statuses: ['Open', 'Closed', 'Pending'],

    // NYC Borough coordinates (approximate centers)
    boroughCoords: {
        'MANHATTAN': { lat: 40.7831, lon: -73.9712 },
        'BROOKLYN': { lat: 40.6782, lon: -73.9442 },
        'QUEENS': { lat: 40.7282, lon: -73.7949 },
        'BRONX': { lat: 40.8448, lon: -73.8648 },
        'STATEN ISLAND': { lat: 40.5795, lon: -74.1502 }
    },

    // Generate random date within range
    randomDate: function(days) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    },

    // Generate random coordinates near a center point
    randomCoords: function(center, spread = 0.1) {
        return {
            lat: center.lat + (Math.random() - 0.5) * spread,
            lon: center.lon + (Math.random() - 0.5) * spread
        };
    },

    // Generate sample 311 requests
    generateSampleData: function(count = 500) {
        const requests = [];

        for (let i = 0; i < count; i++) {
            const borough = this.boroughs[Math.floor(Math.random() * this.boroughs.length)];
            const complaintType = this.complaintTypes[Math.floor(Math.random() * this.complaintTypes.length)];
            const status = this.statuses[Math.floor(Math.random() * this.statuses.length)];
            const coords = this.randomCoords(this.boroughCoords[borough]);
            const createdDate = this.randomDate(30);

            // Closed requests should have a close date
            let closedDate = null;
            if (status === 'Closed') {
                closedDate = new Date(createdDate.getTime() + Math.random() * (Date.now() - createdDate.getTime()));
            }

            requests.push({
                uniqueKey: `311-${Date.now()}-${i}`,
                createdDate: createdDate,
                closedDate: closedDate,
                agency: this.getAgencyForComplaint(complaintType),
                complaintType: complaintType,
                descriptor: this.getDescriptor(complaintType),
                borough: borough,
                status: status,
                latitude: coords.lat,
                longitude: coords.lon,
                address: this.generateAddress(i, borough),
                resolutionDescription: status === 'Closed' ? 'The Department inspected and addressed the issue.' : null
            });
        }

        return requests;
    },

    // Get appropriate agency for complaint type
    getAgencyForComplaint: function(type) {
        const agencies = {
            'Noise': 'NYPD',
            'Heat/Hot Water': 'HPD',
            'Street Condition': 'DOT',
            'Illegal Parking': 'NYPD',
            'Water System': 'DEP',
            'Homeless': 'DHS',
            'Damaged Tree': 'DPR',
            'Graffiti': 'DSNY',
            'Street Light': 'DOT',
            'Blocked Driveway': 'NYPD'
        };
        return agencies[type] || 'NYC311';
    },

    // Get descriptor for complaint type
    getDescriptor: function(type) {
        const descriptors = {
            'Noise': ['Loud Music/Party', 'Construction', 'Barking Dog', 'Car/Truck Horn'],
            'Heat/Hot Water': ['No Heat', 'Insufficient Heat', 'No Hot Water'],
            'Street Condition': ['Pothole', 'Broken Sidewalk', 'Street Flooding'],
            'Illegal Parking': ['Double Parked', 'Blocked Hydrant', 'Posted Parking Sign Violation'],
            'Water System': ['Water Leak', 'Water Quality', 'Hydrant Leaking'],
            'Homeless': ['Homeless Encampment', 'Homeless Person Assistance'],
            'Damaged Tree': ['Fallen Tree', 'Damaged Tree', 'Dead Tree'],
            'Graffiti': ['Street Graffiti', 'Building Graffiti'],
            'Street Light': ['Street Light Out', 'Street Light Knocked Down'],
            'Blocked Driveway': ['Partial Access', 'No Access']
        };
        const options = descriptors[type] || ['General'];
        return options[Math.floor(Math.random() * options.length)];
    },

    // Generate random address
    generateAddress: function(num, borough) {
        const streets = ['Broadway', 'Main St', 'Park Ave', 'Madison Ave', 'Lexington Ave', '5th Ave', 'Atlantic Ave', 'Queens Blvd'];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const number = Math.floor(Math.random() * 9999) + 1;
        return `${number} ${street}, ${borough}, NY`;
    }
};

// Global data storage
let all311Requests = [];
let filtered311Requests = [];

// Initialize data on load
$(document).ready(function() {
    console.log('Generating NYC 311 sample data...');
    all311Requests = NYC311Data.generateSampleData(500);
    filtered311Requests = [...all311Requests];
    console.log(`Generated ${all311Requests.length} sample 311 requests`);
});
