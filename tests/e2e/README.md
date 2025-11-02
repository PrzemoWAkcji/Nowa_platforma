# E2E Testing Suite for Athletics Platform

This directory contains comprehensive end-to-end tests for the Athletics Platform application using Playwright.

## Test Files Overview

### 1. Authentication Tests (`auth.spec.ts`)

Tests the authentication system including:

- Login functionality for different user roles
- Test account system
- User dashboard access
- Role-based access control

### 2. Home Page Tests (`home.spec.ts`)

Tests the main landing page including:

- Display of competition cards
- Search and filtering functionality
- Navigation elements
- CTA buttons

### 3. Competition Management Tests (`competitions.spec.ts`)

Tests competition management features:

- Creating new competitions
- Editing competition details
- Managing competition status
- Importing startlists
- Exporting competition data

### 4. Athletes Management Tests (`athletes.spec.ts`)

Tests athlete management functionality:

- Creating athlete profiles
- Importing athlete data
- Searching and filtering athletes
- Managing athlete information

### 5. Events Management Tests (`events.spec.ts`)

Tests event management features:

- Creating track, field, and relay events
- Managing event schedules
- Event status updates
- Event statistics

### 6. Registration Tests (`registrations.spec.ts`)

Tests registration workflows:

- Athlete registration for competitions
- Registration approval/rejection
- Bulk registration operations
- Registration data export

### 7. Results Management Tests (`results.spec.ts`)

Tests results recording and management:

- Adding track and field results
- Importing results from timing systems
- Result validation and statistics
- Live results functionality

### 8. Combined Events Tests (`combined-events.spec.ts`)

Tests multi-discipline event support:

- Decathlon and Heptathlon management
- Points calculation system
- Multi-day event scheduling
- Combined event rankings

### 9. Admin Panel Tests (`admin.spec.ts`)

Tests administrative functionality:

- User management
- System settings
- Database operations
- System monitoring

### 10. Dashboard Tests (`dashboard.spec.ts`)

Tests user dashboard functionality:

- Role-specific dashboard views
- Statistics and metrics
- Navigation menus
- User profile management

## Test User Accounts

The application includes test accounts for all user roles:

| Role      | Email                  | Password    | Description            |
| --------- | ---------------------- | ----------- | ---------------------- |
| Admin     | admin@athletics.pl     | password123 | Full system access     |
| Organizer | organizer@athletics.pl | password123 | Competition management |
| Coach     | coach@athletics.pl     | password123 | Athlete management     |
| Athlete   | athlete@athletics.pl   | password123 | Personal dashboard     |

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test suite
npx playwright test tests/e2e/auth.spec.ts

# Run tests with UI
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Run tests with specific reporter
npx playwright test --reporter=html
```

## Test Configuration

The tests are configured to:

- Run against `http://localhost:3000`
- Use Chromium browser
- Include video recording on failures
- Take screenshots on failures
- Generate HTML reports

## Test Data

Tests use the existing test data created by the backend scripts:

- `create-test-user.js` - Creates basic test users
- `create-all-test-users.js` - Creates all role-based test users

## Best Practices

1. **Stable Selectors**: Tests use stable selectors like roles, text content, and IDs
2. **Realistic Data**: Tests use realistic test data that matches production scenarios
3. **Clean State**: Each test starts with a clean state
4. **Error Handling**: Tests include proper error handling and assertions
5. **Documentation**: Tests are well-documented with clear descriptions

## Maintenance

To maintain these tests:

1. Update selectors when UI changes
2. Add new tests for new features
3. Update test data when schema changes
4. Review and update assertions regularly
