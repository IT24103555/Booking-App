export function buildBookingReceiptHtml(booking) {
  const eventTitle = booking?.eventId?.title || 'Booking Event';
  const ticketTypeName = booking?.ticketTypeId?.name || 'Ticket Type';
  const paymentMethod = booking?.paymentMethod || '-';
  const paymentStatus = booking?.paymentStatus || '-';
  const paymentReference = booking?.paymentReference || '-';
  const bookingId = booking?._id || '-';
  const totalAmount = booking?.totalAmount != null ? booking.totalAmount : '-';
  const quantity = booking?.quantity != null ? booking.quantity : '-';
  const createdAt = booking?.createdAt ? new Date(booking.createdAt).toLocaleString() : '-';
  const completedAt = booking?.paymentCompletedAt ? new Date(booking.paymentCompletedAt).toLocaleString() : '-';
  const safePaymentDetails = booking?.paymentDetails || {};

  const paymentDetailsHtml = booking?.paymentMethod === 'Card'
    ? `<tr><td>Card brand</td><td>${safePaymentDetails.cardBrand || '-'}</td></tr>
       <tr><td>Card number</td><td>${safePaymentDetails.cardMaskedNumber || '-'}</td></tr>
       <tr><td>Expiry</td><td>${[safePaymentDetails.expiryMonth, safePaymentDetails.expiryYear].filter(Boolean).join(' / ') || '-'}</td></tr>`
    : booking?.paymentMethod === 'Mobile Money'
      ? `<tr><td>Provider</td><td>${safePaymentDetails.provider || '-'}</td></tr>
         <tr><td>Phone number</td><td>${safePaymentDetails.phoneNumber || '-'}</td></tr>`
      : `<tr><td>Payment</td><td>Pay at venue</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${paymentReference}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f7f7fb; color: #182033; margin: 0; padding: 32px; }
      .sheet { max-width: 760px; margin: 0 auto; background: #fff; border-radius: 20px; padding: 32px; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12); }
      .brand { font-size: 12px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #6c5ce7; }
      h1 { margin: 8px 0 4px; font-size: 30px; }
      .muted { color: #667085; margin: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 22px; }
      td { padding: 12px 0; border-bottom: 1px solid #e6e8f0; vertical-align: top; }
      td:first-child { width: 34%; color: #667085; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.6px; }
      .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 24px; }
      .chip { border: 1px solid #e6e8f0; border-radius: 16px; padding: 14px; background: #f8fafc; }
      .chip span { display: block; color: #667085; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px; }
      .chip strong { font-size: 18px; }
      .footer { margin-top: 28px; padding-top: 16px; border-top: 1px dashed #d0d5dd; color: #667085; font-size: 12px; }
      @media print { body { background: #fff; padding: 0; } .sheet { box-shadow: none; border-radius: 0; } }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="brand">Evoria Event Booking</div>
      <h1>Payment Receipt</h1>
      <p class="muted">This document confirms the payment details stored for the booking.</p>

      <div class="summary">
        <div class="chip"><span>Booking ID</span><strong>${bookingId}</strong></div>
        <div class="chip"><span>Reference</span><strong>${paymentReference}</strong></div>
        <div class="chip"><span>Total Amount</span><strong>${totalAmount}</strong></div>
      </div>

      <table>
        <tbody>
          <tr><td>Event</td><td>${eventTitle}</td></tr>
          <tr><td>Ticket Type</td><td>${ticketTypeName}</td></tr>
          <tr><td>Quantity</td><td>${quantity}</td></tr>
          <tr><td>Payment Method</td><td>${paymentMethod}</td></tr>
          <tr><td>Payment Status</td><td>${paymentStatus}</td></tr>
          <tr><td>Payment Completed</td><td>${completedAt}</td></tr>
          ${paymentDetailsHtml}
          <tr><td>Created At</td><td>${createdAt}</td></tr>
        </tbody>
      </table>

      <div class="footer">
        Keep this receipt for your records. Sensitive card information is never stored in full.
      </div>
    </div>
  </body>
</html>`;
}

export function downloadBookingReceipt(booking) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const html = buildBookingReceiptHtml(booking);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `booking-receipt-${String(booking?._id || 'receipt').slice(-8)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}
