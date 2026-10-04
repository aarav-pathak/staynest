export const getBookingRequestTemplate = ({ host, guest, listing, booking, clientUrl }) => {
  const checkInStr = new Date(booking.checkIn).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
  const checkOutStr = new Date(booking.checkOut).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
  const hostUrl = `${clientUrl || 'http://localhost:5174'}/host`;

  const subject = `🏡 New booking request for ${listing.title}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #e11d48; margin-top: 0;">New Booking Request</h2>
      <p>Hi <strong>${host.name}</strong>,</p>
      <p>Good news! <strong>${guest.name}</strong> has requested to book your stay <strong>${listing.title}</strong>.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Trip Details</h3>
        <p style="margin: 6px 0;"><strong>Stay:</strong> ${listing.title} (${listing.city}, ${listing.state})</p>
        <p style="margin: 6px 0;"><strong>Check-in:</strong> ${checkInStr}</p>
        <p style="margin: 6px 0;"><strong>Check-out:</strong> ${checkOutStr}</p>
        <p style="margin: 6px 0;"><strong>Duration:</strong> ${booking.nights} night${booking.nights > 1 ? 's' : ''}</p>
        <p style="margin: 6px 0;"><strong>Guests:</strong> ${booking.guests}</p>
        <p style="margin: 6px 0;"><strong>Total Payout:</strong> ₹${booking.totalPrice?.toLocaleString('en-IN')}</p>
        <p style="margin: 6px 0;"><strong>Guest Email:</strong> ${guest.email}</p>
      </div>

      <p>Please visit your host dashboard to accept or decline this booking request:</p>
      <div style="margin: 24px 0;">
        <a href="${hostUrl}" style="background-color: #e11d48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View in Host Dashboard</a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">StayNest · Open-source student homestay platform</p>
    </div>
  `;

  const text = `Hi ${host.name},\n\n${guest.name} (${guest.email}) has requested to book your stay: ${listing.title}.\n\nDates: ${checkInStr} to ${checkOutStr} (${booking.nights} nights, ${booking.guests} guests)\nTotal Price: ₹${booking.totalPrice}\n\nPlease visit your host dashboard to review: ${hostUrl}\n\nStayNest`;

  return { subject, html, text };
};
