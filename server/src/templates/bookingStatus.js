export const getBookingStatusTemplate = ({ guest, listing, booking, status, clientUrl }) => {
  const isConfirmed = status === 'confirmed';
  const isDeclined = status === 'cancelled';

  const checkInStr = new Date(booking.checkIn).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
  const checkOutStr = new Date(booking.checkOut).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
  const tripsUrl = `${clientUrl || 'http://localhost:5174'}/trips`;

  const statusLabel = isConfirmed ? 'Confirmed' : isDeclined ? 'Declined' : status;
  const statusColor = isConfirmed ? '#16a34a' : isDeclined ? '#dc2626' : '#2563eb';
  const subject = isConfirmed
    ? `🎉 Your booking for ${listing.title} is confirmed!`
    : isDeclined
    ? `Update: Your booking request for ${listing.title} was declined`
    : `Update on your booking for ${listing.title}`;

  const messageIntro = isConfirmed
    ? `Pack your bags! Your host has <strong>confirmed</strong> your booking for <strong>${listing.title}</strong>.`
    : isDeclined
    ? `We're sorry to let you know that the host was unable to accept your booking for <strong>${listing.title}</strong>.`
    : `Your booking for <strong>${listing.title}</strong> is currently <strong>${status}</strong>.`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: ${statusColor}; margin-top: 0;">Booking ${statusLabel}</h2>
      <p>Hi <strong>${guest.name}</strong>,</p>
      <p>${messageIntro}</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Reservation Summary</h3>
        <p style="margin: 6px 0;"><strong>Stay:</strong> ${listing.title} (${listing.city}, ${listing.state})</p>
        <p style="margin: 6px 0;"><strong>Check-in:</strong> ${checkInStr}</p>
        <p style="margin: 6px 0;"><strong>Check-out:</strong> ${checkOutStr}</p>
        <p style="margin: 6px 0;"><strong>Nights:</strong> ${booking.nights}</p>
        <p style="margin: 6px 0;"><strong>Guests:</strong> ${booking.guests}</p>
        <p style="margin: 6px 0;"><strong>Total Price:</strong> ₹${booking.totalPrice?.toLocaleString('en-IN')}</p>
        <p style="margin: 6px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${statusLabel}</span></p>
      </div>

      <p>You can check the details of this and other reservations anytime in your trips:</p>
      <div style="margin: 24px 0;">
        <a href="${tripsUrl}" style="background-color: #e11d48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View My Trips</a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">StayNest · Open-source student homestay platform</p>
    </div>
  `;

  const text = `Hi ${guest.name},\n\nYour booking request for ${listing.title} has been ${statusLabel.toLowerCase()}.\n\nDates: ${checkInStr} to ${checkOutStr} (${booking.nights} nights, ${booking.guests} guests)\nTotal Price: ₹${booking.totalPrice}\n\nView details: ${tripsUrl}\n\nStayNest`;

  return { subject, html, text };
};
