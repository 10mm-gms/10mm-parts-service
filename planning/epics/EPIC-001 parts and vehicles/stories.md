# EPIC-001 Web interface functionality

## User Stories

### [x] US-001: Create a new part
As a user, I want to create a new part, so that I can add it to the parts database. I should be able to specify the following properties:
- Internal part number (auto generated using UUID, not null)
- Internal part code (auto generated using manufacturer, system and part type, and a sequential number`)
- OE Part Number
- Manufacturer Part Number (not null)
- Description (not null)
- System [Powertrain, Transmission, Suspension, Steering, Brakes, Electrical, Body, Interior, Other] (not null)
- Last Known Price
- Last Known Supplier
- Purchase URL
- Notes
- Image
- OE description
- Availability [Available, Backordered, Discontinued] (not null)
- Alternatives [List of alternative internal part numbers]

### [x] US-002: Edit an existing part
As a user, I want to edit an existing part, so that I can update its information.

### [x] US-003: Delete an existing part
As a user, I want to delete an existing part, so that I can remove it from the parts database.

### [x] US-004: View all parts
As a user, I want to view all parts, so that I can see the parts database.

### [x] US-005: View a single part
As a user, I want to view a single part, so that I can see its information.

### [x] US-006: Create a new vehicle
As a user, I want to create a new vehicle, so that I can add it to the vehicle database. I should be able to specify the following properties:
- Make (not null)
- Model (not null)
- From Year (not null)
- To Year
- Power type [MHEV, PHEV, EV] (not null)
- Variant
- Body style [Hatchback, Saloon, Estate, SUV, Coupe, Convertible, MPV, Pickup, Van] (not null)
- Drive type [FWD, RWD, AWD] (not null)
- Trim level

### [x] US-007: Edit an existing vehicle
As a user, I want to edit an existing vehicle, so that I can update its information.

### [x] US-008: Delete an existing vehicle
As a user, I want to delete an existing vehicle, so that I can remove it from the vehicle database.

### [x] US-009: View all vehicles
As a user, I want to view all vehicles, so that I can see the vehicle database.

### [x] US-010: View a single vehicle
As a user, I want to view a single vehicle, so that I can see its information.

### [x] US-011: Link a part to a vehicle
As a user, I want to link a part to a vehicle, so that I can see which parts are compatible with which vehicles.

### [x] US-012: Unlink a part from a vehicle
As a user, I want to unlink a part from a vehicle, so that I can remove the link between a part and a vehicle.

### [x] US-013: View all parts linked to a vehicle
As a user, I want to view all parts linked to a vehicle, so that I can see which parts are compatible with which vehicles.

### [x] US-014: View all vehicles linked to a part
As a user, I want to view all vehicles linked to a part, so that I can see which vehicles are compatible with which parts.

### [x] US-015: Create a new location
As a user, I want to create a new location, so that I can add it to the location database. I should be able to specify the following properties:
- Name (not null)
- Address (not null)
- Notes
- Telephone
- Email

### [x] US-016: Edit an existing location
As a user, I want to edit an existing location, so that I can update its information.

### [x] US-017: Delete an existing location
As a user, I want to delete an existing location, so that I can remove it from the location database.

### [x] US-018: View all locations
As a user, I want to view all locations, so that I can see the location database.

### [x] US-019: View a single location
As a user, I want to view a single location, so that I can see its information

### [x] US-020: Create stock levels
 As a user, I want to create stock levels for a part, so that I can see how many of each part I have in stock. Whilst viewing a part, I should be able to set, edit and remove stock levels for that part for each location. All stock levels should be a single integer.

## [x] US-021: Free text search
As a user, I want to search for parts and vehicles using free text, so that I can find the parts I need. The search should be case insensitive and should search across all fields in the parts and vehicles database using the API. The search should return a list of parts and vehicles that match the search query, sorted by relevance.

# Non-functional requirements

## NFR-001: Performance
The search API should return results within 1 second for 95% of queries.

## NFR-002: Security
The API should be secured against unauthorised access. All API calls should be authenticated using JWT tokens. At this time user authentication is not needed, so a JWT token should be embedded in the front end code, so that it can be used to authenticate API calls without requiring user interaction. If in future the JWT token is removed, the API calls should fail. 

Create, update and delete actions should require a JWT token to be present in the API call. Read operations should not require a JWT token to be present in the API call.

## NFR-003: Data integrity
Data should be saved in a postgres database. The run_docker.sh script should point to a local postgres+sqlite database. DATABASE_URL should be set in the .env file and is mandatory for the container to start. 