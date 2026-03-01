# EPIC-002 Shared Data

As a garage owner, I want to enter into an informal data sharing agreement with other garages, so that we can share parts and vehicle information. This will allow us to see parts and vehicle information that we do not have in our own database. 

## User Stories

### US-001 Shared vehicles

As a user, I want to be able to mark vehicles stored in the database as shared so that a future global parts DB sync tool can sync them to other garages.

#### Acceptance Criteria

- [ ] The user should be able to mark vehicles as shared.
- [ ] The user should be able to unmark vehicles as shared.
- [ ] All vehicles should be marked as shared by default.
- [ ] A simple checkbox should indicate the sharing status. Ticking or unticking the box and then saving the vehicle should update the sharing status.
- [ ] The only thing that changing the sharing status should do is update the sharing status flag in the database. No other functionality should be implemented as part of this story.

### US-002 Shared parts

As a user, I want to be able to mark parts stored in the database as shared so that a future global parts DB sync tool can sync them to other garages.

#### Acceptance Criteria

- [ ] The user should be able to mark parts as shared.
- [ ] The user should be able to unmark parts as shared.
- [ ] All parts should be marked as shared by default.
- [ ] A simple checkbox should indicate the sharing status. Ticking or unticking the box and then saving the part should update the sharing status.
- [ ] The only thing that changing the sharing status should do is update the sharing status flag in the database. No other functionality should be implemented as part of this story.

### US-003 Shared photographs

As a user, I want to be able to mark photographs stored in the database as shared so that a future global parts DB sync tool can sync them to other garages.

#### Acceptance Criteria

- [ ] The user should be able to mark photographs as shared.
- [ ] The user should be able to unmark photographs as shared.
- [ ] All photographs should be marked as shared by default.
- [ ] A simple checkbox should indicate the sharing status. Ticking or unticking the box and then saving the photograph should update the sharing status.
- [ ] The only thing that changing the sharing status should do is update the sharing status flag in the database. No other functionality should be implemented as part of this story.
- [ ] Unticking the sharing status of the part with which any photographs are associated should also unmark all photographs associated with that part as shared.
- [ ] Ticking the sharing status of the part with which any photographs are associated should also mark all photographs associated with that part as shared.
- [ ] If a part is not shared, it should not be possible to mark any photographs associated with that part as shared.
- [ ] If a part is shared, it should be possible to mark all photographs associated with that part as shared.
- [ ] If a part is shared, it should be possible to mark some photographs associated with that part as shared and others as not shared.
- [ ] If a part is shared, it should be possible to mark all photographs associated with that part as not shared.