export function calculateBookingFinancials(baseAmount: number, taxAmount: number, paidAmount = 0) {
  const totalAmount = baseAmount + taxAmount;
  const outstandingBalance = totalAmount - paidAmount;

  return {
    baseAmount,
    taxAmount,
    totalAmount,
    paidAmount,
    outstandingBalance,
    isFullyPaid: outstandingBalance <= 0,
  };
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  // Ensure we're just comparing dates, not times
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays;
}
