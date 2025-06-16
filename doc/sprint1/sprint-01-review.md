# YOUR PRODUCT/TEAM NAME

 > _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
 >      
 > _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.


## Iteration 1 - Review & Retrospect

 * When: June 14th, 2025
 * Where: Online

#### Decisions that turned out well

List process-related (i.e. team organization) decisions that, in retrospect, turned out to be successful.

 * Scheduling a meeting with the founder also helped us a great deal as it allowed us to gain a better grasp on the overall vision of the product and adjust our plans to better fit the wishes of the founder.
 * Delegating frontend and backend roles separately hastened the development as well as splitting tasks to better fit each team member's strengths allowed us to work where we were most comfortable. 
 * Setting up database models first before starting with implementation of the backend was a great decision as it allowed us to easily catch bugs early in the development process before they became a bigger problem to deal with later on. 

#### Decisions that did not turn out as well as we hoped

List process-related (i.e. team organization) decisions that, in retrospect, were not as successful as you thought they would be.

 * We did not do enough preparation for end-to-end testing leading to different machines having different results when using the app. 
 * We also set aside too little time for testing in general, as most of our testing came late in the sprint leading to not enough time to actually fix the issues that arose during testing. 
 * Another crucial mistake we made was not thoroughly testing our app before the scheduled Sprint 1 demo. We had only tested the backend through Postman and after connecting the backend to the frontend we ran into various issues during the demo, leading to a rather unsuccessful demonstration of our project. 

#### Planned changes

List any process-related changes you are planning to make (if there are any)

 * Set up codespaces for end-to-end testing to every machine can have consistent results and setting up the application. 
 * Delegate more testing earlier in the Sprint to not run out of time when fixing bugs.
 * Test each component of the app to ensure full converage. 
 * Implement GitHub workflows to automate testing. 
 * Document bugs found in Jira so none are missed during debugging. 

## Product - Review

#### Goals and/or tasks that were met/completed:

 * Setting up database, making models, adding data.
 * Receiving and sending messages to frontend, routing, retrieving data.
 * Create the UI and link it to the backend.
 * Allow users to log in/sign up and create shipments and receive alerts.

#### Goals and/or tasks that were planned but not met/completed:

 * The alerts were not fully set up as alerts are currently not being automatically sent. This was not met as we are still missing software the founder was going to provide for us. 

## Meeting Highlights

Going into the next iteration, our main insights are:
 
 * Test before the demo to ensure everything works and make sure the code is consistently running on every machine for all members. 
 * Using GitHub workflows, we will integrate automated end-to-end testing to reduce bugs. 
 * Document bugs and any unexpected behaviour properly before fixing it as someone might have an outdated version and might be struggling with it.

