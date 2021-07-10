import {AdSetsStub} from "../support/ad-sets.stub";
import {EndpointHelper} from "../../../src";

describe('Main Page (without the library)', () => {
  it('should display ad set', () => {
    // Prepare
    cy.intercept("GET", /.*\/campaign-api\/ad-sets\/.*/, {
      adSet: {
        id: 5,
        partnerId: 5855,
        unrelatedProperty: "abcd",
        name: 'This is my ad set',
        startDate: new Date('2020-10-20T22:08:46.683'),
        conflictDetectionToken: 1607941414927,
        // missing status property
        audienceType: "invalid type" // No check on enum value
      }
    }).as("getAdSet");

    // Act
    cy.visit("http://localhost:4200");
    cy.wait("@getAdSet"); // Need to hardcode the alias

    // Assert
    cy.get("h1").contains("This is my ad set")
  });

  it('should handled ad set not found', () => {
    // Prepare
    cy.intercept("GET", /.*\/campaign-api\/ad-sets\/.*/, {
      statusCode: 404,
      body: {"this": "is not checked"}, // No type checking
    }).as("getAdSet");

    // Act
    cy.visit("http://localhost:4200");
    cy.wait("@getAdSet"); // Need to hardcode the alias

    // Assert
    cy.get("h1").contains("Ad set not found")
  })
});

describe('Main Page (with the library)', () => {
  const stub = new AdSetsStub().init();
  const getById = stub.endpoints.getById.defaultConfig();

  it('should display ad set', () => {
    // Prepare
    EndpointHelper.stub(getById);

    // Act
    cy.visit("http://localhost:4200");
    // Make sure the ad set is loaded
    cy.wait(getById.alias);

    // Assert
    cy.get("h1").contains("This is my ad set")
    // You might prefer to refer to the fixture directly
    cy.get("h1").contains(getById.fixture?.adSet?.name);
    cy.get("h2").contains(getById.fixture?.adSet?.description);
  });

  it('should handled ad set not found', () => {
    // Prepare
    EndpointHelper.stub(getById.withStatusCode(404).withOverride({
      errors: ["ad set id 12 was not found"] // This is type checked
    }));

    // Act
    cy.visit("http://localhost:4200");
    cy.wait(getById.alias);

    // Assert
    cy.get("h1").contains("Ad set not found")
  })
});
