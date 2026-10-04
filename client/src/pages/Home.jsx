import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';
import { STAY_TYPES } from '../utils/format.js';

const initial = { city: '', type: '', guests: '', maxPrice: '', checkIn: '', checkOut: '' };

export default function Home() {
  const [filters, setFilters] = useState(initial);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const search = (params) => {
    setLoading(true);
    setError('');
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params: clean })
      .then(({ data }) => setListings(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    search(initial);
  }, []);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({
      ...prev,
      checkIn: val,
      checkOut: prev.checkOut && prev.checkOut <= val ? '' : prev.checkOut,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    search(filters);
  };

  return (
    <section>
      <div className="hero">
        <h1>Find your next nest.</h1>
        <p className="muted">Homestays, havelis, villas and hostels across India.</p>
        <form className="search-bar card" onSubmit={submit}>
          <label className="search-field flex-2">
            <span>Where</span>
            <input placeholder="e.g. Jaipur" value={filters.city} onChange={set('city')} />
          </label>
          <label className="search-field">
            <span>Type</span>
            <select value={filters.type} onChange={set('type')}>
              <option value="">Any type</option>
              {STAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="search-field">
            <span>Check-in</span>
            <input
              type="date"
              aria-label="Check-in"
              value={filters.checkIn}
              min={today}
              onChange={handleCheckInChange}
            />
          </label>
          <label className="search-field">
            <span>Check-out</span>
            <input
              type="date"
              aria-label="Check-out"
              value={filters.checkOut}
              min={filters.checkIn || today}
              onChange={set('checkOut')}
            />
          </label>
          <label className="search-field">
            <span>Guests</span>
            <input type="number" min="1" placeholder="Any" value={filters.guests} onChange={set('guests')} />
          </label>
          <label className="search-field">
            <span>Max ₹/night</span>
            <input type="number" min="0" placeholder="Any" value={filters.maxPrice} onChange={set('maxPrice')} />
          </label>
          <div className="search-btn-wrap">
            <button className="btn">Search</button>
          </div>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <Loader />
      ) : listings.length === 0 ? (
        <p className="muted">No stays match your search.</p>
      ) : (
        <div className="grid">
          {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
        </div>
      )}
    </section>
  );
}
