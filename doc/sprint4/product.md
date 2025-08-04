# EpiReady
**EpiReady** is an intelligent monitoring and automated response system designed for the cold-chain logistics industry. It detects risks such as temperature excursions, ETA delays, or extreme weather events and triggers automated workflows to mitigate spoilage and product loss. Inspired by research in disease outbreak prediction, EpiReady enables faster, data-driven decisions by consolidating multiple data sources into a single platform and executing timely responses.

## Target Users

- Cold-chain logistics managers
- Supply chain coordinators for pharmaceuticals, biotech, seafood, and high-value perishables
- Fleet managers responsible for refrigerated transport
- Operations teams in vaccine and reagent distribution
- Team members within organizations who need to collaborate on shipment monitoring

## User needs and Issues

- Every year, the pharmaceutical and biotech industry loses $35B+ to cold-chain failures.

- Up to 50% of vaccines are wasted globally—not from lack of supply, but from poor temperature control
during transit.

- But it’s not just money.
⚠️ When insulin overheats, it becomes useless.
⚠️ When reagents degrade, diagnostics fail.
⚠️ When biologics are delayed, cancer patients wait.

This is a global crisis:

- 25% of vaccines arrive degraded
- 43% of biologic shipments in the U.S. go out of spec
- In low-income regions, 60% of clinics lack reliable electricity
- In just 5 countries, 2.8M doses were lost in one year

### Existing Solutions

There are some existing solutions like Project44, Eupry, and FourKites. However, a lot of these do not include proper temperature regulation. Eupry has temperature sensitive systems but does not include live shipment management. The closest competitor to the product is SensiTech which uses sensitive temperature monitoring and transportation management with alert tracking. The competitive advantage of Epiready over these apps is the weather tracking functionality which predicts the temperature and suggests preventative measures beforehand, the lightweight easy-to-use model which allows small businesses and individual transporters to take on shipments whereas the other software are on a very large enterprise scale in comparison, and the integrated team collaboration features that enable real-time communication during critical shipment events.


## Features
### Priority 1

- **Data Ingestion Hub**
  - Integration with OpenWeatherMap API
  - Sensor data parser (CSV/MQTT)
  - ETA feed connector

- **Intelligent Rule Engine**
  - Visual rule builder
  - Trigger conditions
  - Mapping triggers to automated actions

- **Unified Dashboard**
  - Real-time alert monitoring
  - Manual override
  - Action log with timestamps
  - Visual transit status

- **Risk Alerts**
  - Automated action execution (Slack, SMS, email)
  - Mitigation Suggestion
  - Summary Report

- **Team Collaboration Hub**
  - Real-time chat system for organization members
  - Direct messaging between team members
  - Group chat channels for shipment coordination
  - Organization-based access control and data isolation

### Priority 2: Should Have

- **Outcome Logging**
  - Post-event analysis of what happened and which actions were taken

- **User Role Management**
  - Admin/operator roles
  - Access control for alerts and overrides

- **Enhanced Chat Features**
  - Chat notifications and presence indicators

### Priority 3: Nice to Have

- **Tariff tracker**
  - Tracks tariffs based on country and inform user about any new procedures when crossing border

- **AI-Recommended Playbooks (Tentative)** 
  - ML-generated suggestions for optimal response based on historical incidents

- **Edge Computing Compatibility (Tentative)**
  - Offline fallback and local predictions when internet fails

- **ML-Powered Anomaly Detection (Tentative)**
  - LSTM-based model with 4–12 hour forecasting window
  - Anomaly scoring and alert generation
  - Integration with rule engine


### Definition of Completion



### Task and Roles


#### Sprint 1

- Frontend
- Backend Infrastructure Setup
- REST OpenAPI specs

1. ##### Frontend: Bo, Shubham, David
2. ##### Backend: Eric, Ansh

#### Sprint 2

- Openweather API Integration
- Data parser -> mapping alerts
- Rule Builder

#### Sprint 3

- Text/email alerts
- Manual Override
- Passing logs

#### Sprint 4

- **Team Collaboration Implementation**
  - Real-time chat system with WebSocket integration
  - Organization management with join codes
  - Organization-based shipment visibility controls
  - Direct messaging and group chat functionality

- **User Authentication & Security**
  - JWT-based authentication system
  - Organization-based access control
  - Secure data isolation between organizations

- **Action History & Logging**
  - Comprehensive action tracking for shipments
  - Audit trail for all user operations
  - Action history display in shipment details