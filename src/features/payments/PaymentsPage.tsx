import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePaymentsData } from './usePaymentsData';
import { Card, CardContent } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Search, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Completed': return <Badge variant="success">{status}</Badge>;
    case 'Pending': return <Badge variant="warning">{status}</Badge>;
    case 'Refunded': return <Badge variant="secondary">{status}</Badge>;
    case 'Failed': return <Badge variant="destructive">{status}</Badge>;
    default: return <Badge>{status}</Badge>;
  }
}

export function PaymentsPage() {
  const { payments, isLoading } = usePaymentsData();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Payments Ledger</h1>
          <p className="text-stone-500 mt-1">Track incoming transactions and refunds.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-stone-200 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input className="pl-9" placeholder="Search by reference or booking ID..." />
          </div>
        </div>
        
        <CardContent className="flex-1 overflow-auto p-0">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading ledger...
            </div>
          ) : payments.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8">
              <h3 className="text-lg font-medium text-stone-900">No transactions found</h3>
              <p className="text-stone-500 mt-1">There are no payments recorded for the selected properties.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-stone-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-stone-600">
                      {formatDate(payment.date)}
                    </TableCell>
                    <TableCell className="font-medium text-stone-900 font-mono text-sm">
                      {payment.reference || '-'}
                    </TableCell>
                    <TableCell>
                      {payment.booking_id ? (
                        <span 
                          className="text-teal-600 hover:underline cursor-pointer font-mono text-sm"
                          onClick={() => navigate(`/bookings/${payment.booking_id}`)}
                        >
                          {payment.booking_id.substring(0, 8)}...
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {payment.property?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {payment.payment_method}
                    </TableCell>
                    <TableCell className="font-medium text-stone-900">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
