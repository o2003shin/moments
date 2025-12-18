# Moments

A local-first mobile app for capturing moments in time with photos, notes, and location.

Built with Expo and React Native.

## What this app does

- Capture a photo
- Save a written description
- Store the exact location where the moment happened
- View all moments on a map
- Browse moments in a gallery
- Open a detailed view for each moment
- Delete moments permanently

All data stays on the device.

No backend. No cloud. No accounts.

## Tech stack

- Expo
- React Native
- Expo Router
- Expo File System
- Expo Location
- React Native Maps
- TypeScript

## Data model

Each moment lives in its own directory.


`moment.json` includes:

- description
- createdAt
- latitude
- longitude

This structure keeps moments isolated and easy to manage.

## Architecture

- File system is the source of truth
- Screens read directly from stored directories
- No global state library
- Navigation passes directory URIs, not full objects
- Maps render dynamically from stored metadata

## Screens

- Home  
  Map view with pins for every saved moment

- Gallery  
  Grid view of all photos

- Detailed View  
  Photo, date, description, and map location

- Create Moment  
  Capture photo, record text, save GPS coordinates

## Deleting moments

Deleting a moment removes its entire directory.

This guarantees:

- No orphaned files
- No stale metadata
- No partial deletes

## Why local-first

- Works offline
- No privacy concerns
- No sync complexity
- Simple mental model

## Known limitations

- Android only tested
- No backups
- No editing after creation

## Future ideas

- Edit descriptions
- Export moments
- Cluster map markers
- Search by date or location

## Status

Complete.

Built as a learning project and portfolio piece.
