import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import { formatDate } from '../utils/format.js';

export default function Reviews({ listingId, onReviewAdded }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [editError, setEditError] = useState('');

  const load = () =>
    api
      .get(`/listings/${listingId}/reviews`)
      .then(({ data }) => setReviews(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, [listingId]);

  const userReview = user
    ? reviews.find((r) => String(r.user?._id || r.user) === String(user._id))
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/listings/${listingId}/reviews`, form);
      setForm({ rating: 5, comment: '' });
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditForm({ rating: review.rating, comment: review.comment });
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const submitEdit = async (e, reviewId) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.put(`/listings/${listingId}/reviews/${reviewId}`, editForm);
      setEditingId(null);
      load();
      onReviewAdded?.();
    } catch (err) {
      setEditError(getErrorMessage(err));
    }
  };

  const removeReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setError('');
    try {
      await api.delete(`/listings/${listingId}/reviews/${reviewId}`);
      load();
      onReviewAdded?.();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="reviews">
      <h2>Reviews ({reviews.length})</h2>
      {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {reviews.map((r) => {
        const isOwn = user && String(r.user?._id || r.user) === String(user._id);
        const isEditing = editingId === r._id;

        if (isEditing) {
          return (
            <form key={r._id} className="card form" onSubmit={(e) => submitEdit(e, r._id)}>
              <h3>Edit your review</h3>
              <StarRating
                value={editForm.rating}
                onChange={(rating) => setEditForm({ ...editForm, rating })}
              />
              <textarea
                required
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
              />
              {editError && <p className="error">{editError}</p>}
              <div className="row">
                <button className="btn">Save changes</button>
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          );
        }

        return (
          <div key={r._id} className="review">
            <div className="row-between">
              <div>
                <strong>{r.user?.name || 'Guest'}</strong>
                {isOwn && <span className="muted small"> (You)</span>}
              </div>
              <span className="muted small">{formatDate(r.createdAt)}</span>
            </div>
            <div className="stars-static">
              {'★'.repeat(r.rating)}
              {'☆'.repeat(5 - r.rating)}
            </div>
            <p>{r.comment}</p>
            {isOwn && (
              <div className="row" style={{ marginTop: '8px', gap: '8px' }}>
                <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.85rem' }} onClick={() => startEdit(r)}>
                  Edit
                </button>
                <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.85rem' }} onClick={() => removeReview(r._id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      })}

      {user && !userReview && (
        <form className="card form" onSubmit={submit}>
          <h3>Write a review</h3>
          <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          <textarea
            required
            placeholder="How was your stay?"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button className="btn">Submit review</button>
        </form>
      )}
    </section>
  );
}
