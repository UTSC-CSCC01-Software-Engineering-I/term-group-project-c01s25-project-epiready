describe('EpiReady Navigation and Page Structure', () => {
  const email = 'garg@gmail.com';
  const password = 'garg';

  beforeEach(() => {
    cy.visit('/');
  });

  it('shows the navbar on all main pages except Organization', () => {
    // Home
    cy.get('nav').should('exist');
    cy.visit('/shipments');
    cy.get('nav').should('exist');
    cy.visit('/alerts');
    cy.get('nav').should('exist');
    cy.visit('/monitor');
    cy.get('nav').should('exist');
    cy.visit('/track');
    cy.get('nav').should('exist');
    cy.visit('/credits');
    cy.visit('/organization');
    cy.get('nav').should('not.exist');
  });

  it('navbar links navigate to the correct pages', () => {
    cy.get('nav').within(() => {
      cy.get('a').contains('Shipments').click();
    });
    cy.url().should('include', '/shipments');
    cy.get('nav').within(() => {
      cy.get('a').contains('Alerts').click();
    });
    cy.url().should('include', '/alerts');
    cy.get('nav').within(() => {
      cy.get('a').contains('Organization').click();
    });
    cy.url().should('include', '/organization');
  });

  it('shows shipment details, tabs, and graphs for a shipment when logged in', () => {
    // Log in first
    cy.contains('Log In').click();
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Sign Out').should('be.visible');

    // Visit the shipments page and click the second shipment card
    cy.visit('/shipments');
    cy.get('[class*="shipmentCard"]').first().click();

    // Should be on a shipment page (URL includes /shipments/)
    cy.url().should('include', '/shipments/');

    // Info tab should be visible and selected by default
    cy.contains('Info').should('have.class', 'font-semibold');
    cy.contains('Risk:').should('exist');
    cy.contains('Humidity:').should('exist');
    cy.contains('Internal Temperature:').should('exist');
    cy.contains('External Temperature:').should('exist');

    // Switch to Location tab and check for map
    cy.contains('Location').click();
    cy.get('iframe').should('exist');

    // Switch to History tab and check for action history
    cy.contains('History').click();
    cy.contains('Action History').should('exist');

    // Switch to Graphs tab and check for charts
    cy.contains('Graphs').click();
    cy.contains('Analytics Dashboard').should('exist');
    cy.contains('Temperature Monitoring').should('exist');
    cy.contains('Humidity Levels').should('exist');
  });

  it('shows recent alerts and link to all alerts on Home when logged in', () => {
    cy.contains('Log In').click();
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Sign Out').should('be.visible');
    cy.visit('/');
    cy.contains('Recent Alerts').should('exist');
    cy.get('[class*="cardContainer"]').should('exist');
    cy.contains('See all').should('have.attr', 'href', '/alerts');
  });

  it('alerts page shows alert cards', () => {
    cy.contains('Log In').click();
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Sign Out').should('be.visible');
    cy.visit('/alerts');
    cy.get('[class*="cardContainer"]').should('exist');
    cy.get('[class*="cardContainer"]').should('have.length.greaterThan', 0);
  });

  it('authentication forms work for login and signup', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Email"]').type('testuser@example.com');
    cy.get('input[placeholder="Password"]').type('testpass');
    cy.get('button[type="submit"]').click();
    cy.visit('/signup');
    cy.get('input[placeholder="Email"]').type('newuser@example.com');
    cy.get('input[placeholder="Password"]').type('newpass');
    cy.get('button[type="submit"]').click();
  });
});
