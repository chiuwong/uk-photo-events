@AGENTS.md

# Project: England Photo Events

England-wide event discovery and photography planning web app.

## Purpose
Help a London-based street/documentary photographer discover and plan shoots around public events across England.

## User
Street / documentary photographer based in London. Needs fast, field-usable UI for scanning events and deciding whether to travel.

## Scope
England-wide coverage. London is a priority region, but not the whole product.

## Content focus
- Protests and demonstrations
- Marches and rallies
- Folk customs and seasonal traditions
- Religious festivals and ceremonies
- Parades and carnivals
- Local fairs and community festivals
- Processions, vigils, memorials, public gatherings
- Culturally significant or visually interesting public events

## Product principles
- Mobile first
- Fast to scan, practical in the field
- Map, calendar, and list views are core
- Photography metadata is first-class — not optional
- Source provenance matters (where did this event come from, when was it last checked)
- Manual curation is important
- Recurring annual customs must be supported cleanly alongside one-off events

## Geography model
England → region → county → city/town → venue/route → coordinates

Regions:
- London
- South East
- South West
- East of England
- West Midlands
- East Midlands
- North West
- North East
- Yorkshire

## Stack
- Next.js 15 (App Router)
- PostgreSQL + Prisma ORM
- Leaflet.js for maps (free, no paid API key)
- FullCalendar for calendar views
- Tailwind CSS
- NextAuth.js for admin auth (single user)

## Architecture rules
- Keep architecture simple — avoid unnecessary abstraction
- Use clear naming throughout
- Prefer maintainable code over clever code
- Ask before adding any paid third-party services
- Preserve working code unless change is strictly necessary
- Use environment variables for all secrets and config

## Key data concepts
- Events have a PhotoMeta record (1:1) for photography-specific scoring
- Events have EventSource records (many) to track provenance
- UserSave table for bookmarks, shortlist, personal notes
- DuplicateCandidate table for admin duplicate review workflow
- Events can be one-off or recurring_annual
- Events can have route_description (for marches/processions)
- Status: scheduled | changed | cancelled | unconfirmed

## Admin workflow
Single-user admin (env-var auth). Key tasks:
- Add / edit events manually
- Approve / reject imported events
- Review and merge duplicate candidates
- Set photo potential score and photography notes
- Feature or archive events
- CSV import with field mapping

## What NOT to do
- Do not add paid map tile services without asking
- Do not rewrite working code unless necessary
- Do not over-abstract — prefer simple, readable solutions
- Do not scope-creep into non-England events without discussion
