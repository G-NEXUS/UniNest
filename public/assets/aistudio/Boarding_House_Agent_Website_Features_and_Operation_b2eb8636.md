# Boarding House Agent Website: Features and Operation

A plan for a boarding house website where an agent lists rooms for landlords, and students pay a per-listing agent fee to unlock the landlord's exact location and phone number.

## 1. How it works (the flow)

1. Landlord registers and submits a listing (photos, price, rules, location, phone).
2. Admin (the agent) verifies and approves it.
3. Student browses listings and sees only safe public info.
4. Student taps "Unlock contact" and pays the agent fee for that listing.
5. Payment is confirmed, and the exact location and landlord phone are revealed.
6. Student contacts the landlord and views the room.

## 2. What students see BEFORE paying

- Photos, price per month/term, room type (single, shared, self-contained)
- Amenities (water, electricity, WiFi, security, kitchen, toilet)
- General area only (e.g. "Near CBU, Riverside"), never the street or plot number
- Distance to campus or town
- Gender or house rules, and availability status
- Landlord rating or "verified" badge
- A blurred or hidden contact section with the Unlock button

## 3. What is revealed AFTER paying

- Exact address and a map pin
- Landlord name and phone number (call and WhatsApp buttons)
- Viewing instructions

## 4. Student features

- Sign up and login (email or phone, OTP verification)
- Search and filters: price, area, room type, amenities, distance
- Save or favourite listings
- Payment history and "My unlocked listings" page
- Report a listing (fake, already taken, wrong info)
- Rate the listing after viewing

## 5. Landlord features

- Register and verify identity (ID or proof of ownership)
- Add, edit and delete listings
- Mark rooms as available or taken
- See how many students unlocked their listing
- Notification when a listing is approved or unlocked

## 6. Admin (agent) panel

- Approve or reject listings
- Manage users (ban fake accounts)
- View all payments and approve manual ones
- Set the agent fee per listing
- Handle reports and refund requests
- Dashboard: total listings, unlocks, income

## 7. Payment (not decided yet, so here are the options)

| Option | Pros | Cons |
| --- | --- | --- |
| Mobile money API (MTN/Airtel via an aggregator) | Automatic, most common in Zambia | Needs integration and business setup |
| Manual (student sends money, uploads proof, admin approves) | Easiest to start | Slow, open to fake screenshots |
| Card payment | Works for anyone | Fewer students use it |

Suggestion: start with manual approval to launch fast, then move to mobile money automation.

## 8. Protecting the hidden info (important)

Hiding it with CSS or JavaScript is not enough, because anyone can open DevTools and see it.

- Store phone and exact address in the database, and send them only from the backend after verifying payment.
- The public listing API must never return those fields.
- Use a backend (Firebase with security rules, or your own server) to check: has this user paid for this listing? Only then return the data.
- Don't put contact info in image alt text, page source or URLs.
- Rate-limit unlock requests and log every unlock.

## 9. Database structure (simple)

- **users**: id, name, phone, role (student/landlord/admin)
- **listings**: id, landlordId, price, photos, publicArea, status
- **privateDetails**: listingId, exactAddress, phone (protected)
- **payments**: id, studentId, listingId, amount, status, reference
- **unlocks**: studentId, listingId, date

## 10. Trust and safety

- Verified landlord badge
- Refund policy (e.g. listing was fake or already taken)
- Terms: the agent fee is non-transferable and the contact must not be resold
- Warn students never to pay the landlord before viewing

## 11. Extra features (later)

- WhatsApp notifications
- Reviews from students who rented
- "Available from" date alerts
- Multi-language and low-data mode for slow networks
- PWA so it works like an app

## Suggested build order

1. Listings page and search (front end)
2. Auth (students and landlords)
3. Landlord listing submission and admin approval
4. Protected private details and unlock logic
5. Payment (manual first)
6. Ratings, reports, extras
