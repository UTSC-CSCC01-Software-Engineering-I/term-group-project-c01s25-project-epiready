# EpiReady Sprint 3 Release Planning Meeting

## Release Goal
To implement comprehensive alert management and action tracking capabilities for the cold-chain logistics monitoring system, enabling users to receive real-time notifications, manage alert statuses, and maintain detailed action logs for audit trails.

## Project Scope

### Included Features

#### 1. Alert Management System
- **Purpose**: Complete alert lifecycle management with status tracking
- **Details**: Alert creation, status updates (active, inprogress, resolved), alert deactivation, and comprehensive alert history with timestamps

#### 2. Action History & Logging
- **Purpose**: Detailed tracking of all actions taken on shipments and alerts
- **Details**: ActionLog model for alert-related actions, ShipmentAction model for shipment operations, and comprehensive action history API endpoints

<!-- #### 3. Manual Override Capabilities
- **Purpose**: Allow users to manually control alert statuses and actions
- **Details**: Alert status override functionality, action creation and management, and user permission-based access control -->

#### 3. Real-time Alert Notifications
- **Purpose**: Instant notification delivery through WebSocket connections
- **Details**: Real-time breach alerts, temperature monitoring, and live status updates with socket-based communication

#### 4. Organization Management System
- **Purpose**: Multi-tenant organization support for team collaboration
- **Details**: Organization creation, join code system, user organization association, and organization-based access control

#### 5. Shipment Analytics & Visualization
- **Purpose**: Data visualization and historical analysis for shipment monitoring
- **Details**: Graphs tab with temperature/humidity charts, history tab with action logs and timeline, and interactive data visualization components

### Excluded Features
- **SMS/Text Alerts**: Limited to email notifications due to unnecessary api costs addition
- **Change Password**: Axed due to safety and security concerns for users
## Bug Fixes
- Fixed alert status update functionality
- Resolved action history display issues
- Improved error handling for alert management operations

## Non-Functional Requirements

| Requirement    | Description                                                         | Measurable Criteria                          |
|----------------|---------------------------------------------------------------------|----------------------------------------------|
| **Performance** | Alert system responds within 500ms for email delivery             | 95% of email alerts delivered within 500ms    |
| **Security**    | Alert access control and action logging                           | All alert operations require valid authentication |
| **Usability**   | Intuitive alert management interface                              | Users can manage alerts in under 1 minute     |
| **Reliability** | Robust email delivery and alert persistence                       | 99% alert delivery success rate               |
| **Data Integrity** | Complete audit trail for all actions                            | 100% action logging accuracy                  |

## Dependencies
- **Real-time Communication**: Flask-SocketIO with eventlet
- **Database**: PostgreSQL with Alembic migrations
- **Frontend**: React with Socket.IO client
- **Authentication**: JWT token-based with role-based access

## Known Limitations
- **Email Rate Limiting**: Maximum 2 emails per monitoring cycle to stay within free tier for email pushes
- **Mock Data**: Temperature and humidity data still simulated rather than real sensor feeds due to missing OpenWeatherAPI
- **Limited Email Customization**: Basic email templates without rich formatting
- **No SMS Integration**: Text alerts not implemented due to service costs

## Participants
- **Frontend Team**: Bo, Shubham, David
- **Backend Team**: Eric, Ansh
- **Project Lead**: Team coordination and feature prioritization
- **Stakeholder**: Founder consultation for feature requirements

## Release Criteria
- All alert management endpoints functional and tested
- Email notification system operational with error handling
- Action history tracking working for all user operations
- Real-time notifications delivering alerts within 1 second
- Manual override capabilities accessible to authorized users