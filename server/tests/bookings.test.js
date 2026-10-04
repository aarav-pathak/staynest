import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Listing from '../src/models/Listing.js';
import Booking from '../src/models/Booking.js';
import generateToken from '../src/utils/generateToken.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setupDb.js';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('POST /api/bookings', () => {
  let hostUser;
  let guestUser;
  let hostToken;
  let guestToken;
  let listing;

  beforeEach(async () => {
    hostUser = await User.create({
      name: 'Host User',
      email: 'host@test.com',
      password: 'password123',
      role: 'host',
    });
    hostToken = generateToken(hostUser._id);

    guestUser = await User.create({
      name: 'Guest User',
      email: 'guest@test.com',
      password: 'password123',
      role: 'guest',
    });
    guestToken = generateToken(guestUser._id);

    listing = await Listing.create({
      title: 'Cozy Mountain Villa',
      description: 'A serene mountain stay with stunning views.',
      type: 'villa',
      city: 'Manali',
      state: 'Himachal Pradesh',
      address: '123 Pine Road',
      pricePerNight: 2000,
      maxGuests: 4,
      bedrooms: 2,
      amenities: ['WiFi', 'Kitchen', 'Heater'],
      host: hostUser._id,
      isActive: true,
    });
  });

  test('valid booking → 201 with correct nights and price', async () => {
    const checkIn = '2026-11-01';
    const checkOut = '2026-11-04'; // 3 nights
    const guests = 2;

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn,
        checkOut,
        guests,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.listing).toBe(listing._id.toString());
    expect(res.body.guest).toBe(guestUser._id.toString());
    expect(res.body.nights).toBe(3);
    expect(res.body.totalPrice).toBe(6000); // 3 nights * 2000 pricePerNight
    expect(res.body.status).toBe('pending');

    const savedBooking = await Booking.findById(res.body._id);
    expect(savedBooking).not.toBeNull();
    expect(savedBooking.nights).toBe(3);
    expect(savedBooking.totalPrice).toBe(6000);
  });

  test('check-out before check-in → 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn: '2026-11-05',
        checkOut: '2026-11-02', // Invalid: check-out before check-in
        guests: 2,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/check-out must be at least one day after check-in/i);
  });

  test('too many guests → 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn: '2026-11-01',
        checkOut: '2026-11-03',
        guests: 6, // Exceeds maxGuests of 4
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/maximum of 4 guests/i);
  });

  test('host booking own listing → 400', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        listingId: listing._id.toString(),
        checkIn: '2026-11-01',
        checkOut: '2026-11-03',
        guests: 2,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot book your own listing/i);
  });
});
