
# Phayao Asset Hub (อสังหาฯ พะเยา)

Web application for browsing and submitting real estate properties in Phayao, Thailand.
Built with React, Tailwind CSS, and Firebase (Firestore + Cloudinary).

## Features

- **Property Listing**: Browse houses, land, and dormitories.
- **Filtering**: Filter properties by type.
- **Property Details**: View price, location map, size, and image gallery.
- **Admin System**: Manage property listings (Add/Edit/Delete).
- **Line Integration**: Direct contact via LINE OA.
- **PWA Support**: Installable on mobile devices.

## Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Storage**: Cloudinary (for images)
- **Maps**: Leaflet (OpenStreetMap)

## Setup & Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on your Firebase/Cloudinary credentials (see `firebaseConfig.ts` and `services/propertyService.ts`).
4. Run locally:
   ```bash
   npm run dev
   ```

## Admin Access

- **URL**: `/login`
- **Default Credentials**: `admin` / `1234`

## Deployment

This project is optimized for deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. Vercel will detect Vite and build automatically.
3. Ensure Environment Variables are set if you decide to move credentials out of the code.

## License

Private / Proprietary
