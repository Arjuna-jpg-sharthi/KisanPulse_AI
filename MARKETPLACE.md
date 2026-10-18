# Kisan Vyapar Marketplace

The Marketplace screen now has a database-backed farmer/buyer exchange.

## How the prototype works

- Farmers post crop, variety, available quantity, expected price, negotiation floor/ceiling, harvest-ready date, location, quality notes, optional contact number, and an optional JPG/PNG/WebP image (up to 5 MB).
- Buyers post crop, required quantity, minimum quantity they can accept, budget range, needed-by date, location, and optional notes.
- The API matches the same crop when the farmer's and buyer's price ranges overlap or are no more than 10% apart, and the farmer can meet the buyer's minimum quantity. Matches are ranked using price gap, quantity, and same-state location.
- Public listing cards hide phone numbers. A matched pair sees both listing IDs and the supplied contact numbers and can open a text chat or exchange recorded voice notes.
- Chat messages are stored in SQLite and refreshed every four seconds. Voice notes are saved as audio files under `server/uploads/marketplace` (10 MB maximum).

## Run locally

Use `npm run dev:full` from the project folder, then open `http://localhost:3000`. The full script starts Vite and the API. If running them separately, use `npm run dev` and `npm run server` in separate PowerShell windows.

## Prototype limits

This is a hackathon prototype, not a production marketplace. It has no user login/identity verification, payment or order settlement, live audio calling, moderation, or cloud media storage. Listing IDs identify demo posts; do not publish real personal information. The SQLite database and uploaded photos/voice notes are local to the machine running the API. For multiple laptops, host the API on a reachable shared server and configure the frontend to use it. Production use needs authenticated authorization on listings, contacts, and chats, HTTPS, data retention controls, and cloud storage. Voice chat here means recorded voice notes, not live calls.
