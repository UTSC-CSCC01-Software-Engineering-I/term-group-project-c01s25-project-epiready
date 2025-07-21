# EpiReady

 > _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
 >      
 > _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.


## Iteration 3 - Review & Retrospect

 * When: July 20th, 2025
 * Where: Online

#### Decisions that turned out well

* Implementing email alerts with Flask-Mail was successful and provides reliable notification delivery for critical temperature breaches. The integration with the existing socket system ensures real-time updates reach users immediately.
* The action history and logging system provides comprehensive audit trails, which is crucial for medical logistics compliance and accountability.
* Manual override capabilities give users control over alert management, improving the system's usability and trustworthiness.
* The modular approach to alert management (separate models for Alert and ActionLog) allows for flexible future enhancements.

#### Decisions that did not turn out as well as we hoped

* We had to limit email notifications to 2 per monitoring cycle to prevent spam, which may not be sufficient for high-volume operations.
* SMS/text alerts were not implemented due to the complexity of integrating third-party SMS services, limiting notification options.
* The alert system still relies on mock data rather than real sensor feeds, which affects the authenticity of the monitoring experience.
* The alert system still relies on mock data rather than real sensor feeds, which affects the authenticity of the monitoring experience.

## Product - Review

#### Goals and/or tasks that were met/completed:

* Successfully implemented email alert system with Flask-Mail integration for temperature and humidity breach notifications
* Created comprehensive alert management system with status tracking (active, inprogress, resolved)
* Implemented action history and logging with ActionLog and ShipmentAction models
* Added manual override capabilities for alert status management
* Established real-time alert notifications through WebSocket connections
* Created alert viewing interface with pagination and filtering capabilities
* Implemented alert deactivation functionality for better user control
* Added shipment analytics with graphs tab showing temperature/humidity charts and trends
* Implemented history tab with comprehensive action logs and timeline visualization
* Implemented organization management system with creation and joining functionality

#### Goals and/or tasks that were planned but not met/completed:

* SMS/text alerts were not implemented due to third-party service integration complexity and time constraints
* Real-time push notifications for mobile devices were not implemented
* Custom alert rules configuration interface was not developed - alerts use predefined conditions
* Real-time push notifications for mobile devices were not implemented
* Integration with real sensor data feeds instead of mock data was not achieved

## Meeting Highlights

Going into the next iteration, our main insights are:

* The alert system foundation is solid and provides a good base for future enhancements. The modular design allows for easy addition of new notification channels and alert types.
* We need to prioritize real data integration to make the system more valuable for actual cold-chain operations. Mock data limits the system's practical utility.
* User feedback indicates a need for more sophisticated alert visualization and analytics to help identify trends and patterns in shipment issues.
* The email rate limiting (2 emails per cycle) may need to be configurable based on user needs and operational requirements.
* Future sprints should focus on data integration, advanced analytics, and mobile notification capabilities to make the system more comprehensive and user-friendly.