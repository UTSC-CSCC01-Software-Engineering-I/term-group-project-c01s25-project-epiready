
Release Scope

Outline what is included in and excluded from the release, detailing key features or improvements, bug fixes, non-functional requirements, etc.
* Able to view individual shipments and their data
* Able to track shipments using Google Maps
* Fixed login/signup issues and various UI errors


Included Features
* Individual Shipment Monitoring
	* Users can now view data regarding individual shipments and see updates on their status live. They can also track the location of shipments live. 
* Enhanced Shipment Management
	* Improved shipment creation form with comprehensive field validation
	* Expandable shipment cards with detailed product information, destination, and status
	* Real-time status indicators with color-coded alerts (On Track, Warning, Severe, Critical)
	* Temperature range specification for cold-chain sensitive products
	* AQI and humidity sensitivity settings for environmental monitoring
	* Transit time tracking with hours and minutes precision
* User Interface Improvements
	* Responsive design for mobile and desktop platforms
	* Intuitive shipment creation popup with form validation
	* Clean, professional UI with consistent styling across components

Excluded Features
* No longer using APIs to gather shipment information, instead using mock data. 

Bug Fixes
* Fixed signup/login error messages
* Fixed API routes handling
* Fixed UI for shipments

Non-Functional Requirements

| Requirement    | Description                                                         | Measurable Criteria                          |
|----------------|---------------------------------------------------------------------|----------------------------------------------|
| **Performance** | Backend API responses within 300ms under typical load             | 100% of shipment CRUD operations complete in under 300ms |
| **Security**    | Continued Bearer token authentication with protected routes        | All shipment operations require valid authentication token |
| **Usability**   | Intuitive shipment creation and monitoring interface              | Users can create a shipment in under 2 minutes with zero errors |
| **Reliability** | Graceful error handling for network failures and invalid input   | Appropriate error messages displayed for all failure scenarios |
| **Responsiveness** | Mobile-friendly interface for shipment monitoring            | UI components render correctly on screen sizes 320px and above |
| **Data Integrity** | Accurate shipment status tracking and data persistence        | 100% data consistency between frontend and database |

Dependencies
* **Frontend Framework**: React 18+ with Vite build system
* **Backend Framework**: Flask with SQLAlchemy ORM
* **Database**: PostgreSQL 12+ for data persistence
* **Styling**: Tailwind CSS for responsive design
* **Development Environment**: Node.js 16+ and Python 3.8+
* **Browser Support**: Modern browsers with ES6+ support

Known Limitations
* **Simulated Data**: Shipment status, temperature readings, and location data are currently static/dummy data rather than live sensor feeds
* **Limited Status Updates**: Shipment status changes are manual rather than automated based on real conditions
* **No Real-time Notifications**: Alert system shows static examples rather than dynamic condition-based alerts
* **Single User Role**: No role-based access control - all authenticated users have identical permissions
* **Local Development**: Backend currently configured for localhost development environment only
