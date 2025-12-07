# Persons Resource Mapping

Maps Ethos `persons` resource to `Person` and related tables.

## Core Person Table

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| `id` | `Person.id` | UUID | Primary key, Ethos GUID |
| `birthDate` | `Person.birthDate` | Date | Date of birth |
| `gender` | `Person.gender` | String | Gender code (male, female, etc.) |
| `citizenshipStatus` | `Person.citizenshipStatus` | String | Citizenship status code |
| - | `Person.createdAt` | DateTime | Audit field (not from Ethos) |
| - | `Person.updatedAt` | DateTime | Audit field (not from Ethos) |

## PersonName Table (from `names[]` array)

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| - | `PersonName.id` | UUID | Primary key (generated) |
| `names[].given` | `PersonName.given` | String | First name |
| `names[].middle` | `PersonName.middle` | String? | Middle name (nullable) |
| `names[].family` | `PersonName.family` | String | Last name |
| `names[].type` | `PersonName.type` | String | Name type (legal, preferred, etc.) |
| `names[].preferred` | `PersonName.preferred` | Boolean | Is this the preferred name? |
| - | `PersonName.personId` | UUID (FK) | Foreign key to `Person.id` |
| - | `PersonName.createdAt` | DateTime | Audit field |
| - | `PersonName.updatedAt` | DateTime | Audit field |

## EmailAddress Table (from `emails[]` array)

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| - | `EmailAddress.id` | UUID | Primary key (generated) |
| `emails[].address` | `EmailAddress.address` | String | Email address |
| `emails[].type` | `EmailAddress.type` | String | Email type (personal, institutional, etc.) |
| `emails[].preferred` | `EmailAddress.preferred` | Boolean | Is this the preferred email? |
| - | `EmailAddress.personId` | UUID (FK) | Foreign key to `Person.id` |
| - | `EmailAddress.createdAt` | DateTime | Audit field |
| - | `EmailAddress.updatedAt` | DateTime | Audit field |

## Phone Table (from `phones[]` array)

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| - | `Phone.id` | UUID | Primary key (generated) |
| `phones[].number` | `Phone.number` | String | Phone number |
| `phones[].extension` | `Phone.extension` | String? | Phone extension (nullable) |
| `phones[].type` | `Phone.type` | String | Phone type (mobile, home, work, etc.) |
| `phones[].preferred` | `Phone.preferred` | Boolean | Is this the preferred phone? |
| - | `Phone.personId` | UUID (FK) | Foreign key to `Person.id` |
| - | `Phone.createdAt` | DateTime | Audit field |
| - | `Phone.updatedAt` | DateTime | Audit field |

## Address Table (from `addresses[]` array)

| Ethos Field Path | DB Column / Relation | Type | Notes |
|------------------|----------------------|------|-------|
| - | `Address.id` | UUID | Primary key (generated) |
| `addresses[].type` | `Address.type` | String | Address type (home, mailing, etc.) |
| `addresses[].lines` | `Address.line1`, `Address.line2` | String, String? | Address lines (line1 required, line2 optional) |
| `addresses[].city` | `Address.city` | String | City |
| `addresses[].state` | `Address.state` | String | State code |
| `addresses[].postalCode` | `Address.postalCode` | String | ZIP/postal code |
| `addresses[].country` | `Address.country` | String | Country code |
| - | `Address.personId` | UUID (FK) | Foreign key to `Person.id` |
| - | `Address.createdAt` | DateTime | Audit field |
| - | `Address.updatedAt` | DateTime | Audit field |

## Not Mapped (Phase 02)

- `ethnicities[]` - Will be handled in future phase if needed
- `races[]` - Will be handled in future phase if needed
- `credentials[]` - SSN/other credentials not stored in Phase 02






