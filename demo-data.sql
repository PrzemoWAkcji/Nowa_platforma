-- Demo data for testing import functionality
-- Run this in your SQLite database to create test competition

-- Insert a test competition
INSERT INTO Competition (
  id, 
  name, 
  description, 
  startDate, 
  endDate, 
  location, 
  status, 
  type, 
  createdAt, 
  updatedAt
) VALUES (
  'demo-competition-001',
  'Zawody Testowe - Import List Startowych',
  'Zawody utworzone do testowania funkcjonalności importu list startowych',
  '2025-02-01T10:00:00.000Z',
  '2025-02-02T18:00:00.000Z',
  'Stadion Testowy, Warszawa',
  'PLANNED',
  'OUTDOOR',
  datetime('now'),
  datetime('now')
);

-- Insert a test user (organizer)
INSERT INTO User (
  id,
  email,
  firstName,
  lastName,
  role,
  createdAt,
  updatedAt
) VALUES (
  'demo-user-001',
  'organizer@test.com',
  'Jan',
  'Organizator',
  'ORGANIZER',
  datetime('now'),
  datetime('now')
);

-- You can now use competition ID: demo-competition-001 for testing import