import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import ListingCard from '../components/ListingCard.jsx';
import Loader from '../components/Loader.jsx';

export default function Wishlist() {
  const [stays, setStays] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    api
      .get('/auth/wishlist')
      .then(({ data }) => setStays(data))
      .catch((err) => setError(getErrorMessage(err)));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = (listingId) => {
    setStays((prev) => prev?.filter((s) => s._id !== listingId));
  };

  if (error) return <p className="error">{error}</p>;
  if (!stays) return <Loader />;

  return (
    <section>
      <h1>My Wishlist ({stays.length})</h1>
      {stays.length === 0 ? (
        <div className="empty">
          <p className="muted" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
            No saved stays yet. Click the heart (♥) on any stay to save it here!
          </p>
          <Link to="/" className="btn">
            Explore Stays
          </Link>
        </div>
      ) : (
        <div className="grid">
          {stays.map((listing) => (
            <ListingCard key={listing._id} listing={listing} onWishlistToggle={handleToggle} />
          ))}
        </div>
      )}
    </section>
  );
}
