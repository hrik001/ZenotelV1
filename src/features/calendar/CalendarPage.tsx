import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalendarData } from './useCalendarData';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { formatDate } from '../../lib/formatters';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Booking } from '../../types';

export function CalendarPage() {
  const { bookings, units, isLoading, days, nextWeek, prevWeek, today } = useCalendarData();
  const navigate = useNavigate();

  const getBookingForUnitAndDate = (unitId: string, dateStr: string): Booking | undefined => {
    return bookings.find(b => 
      b.unit_id === unitId && 
      dateStr >= b.check_in && 
      dateStr < b.check_out // Don't show booking on checkout day to leave slot empty
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-teal-100 border-teal-200 text-teal-800';
      case 'Checked In': return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'Pending': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      default: return 'bg-stone-200 border-stone-300 text-stone-800';
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Calendar</h1>
          <p className="text-stone-500 mt-1">14-day timeline view</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={today}>Today</Button>
          <div className="flex border border-stone-200 rounded-md ml-2">
            <Button variant="ghost" className="px-2 border-r border-stone-200 rounded-none rounded-l-md" onClick={prevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" className="px-2 rounded-none rounded-r-md" onClick={nextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardContent className="p-0 flex-1 overflow-auto flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-stone-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading calendar...
            </div>
          ) : (
            <div className="min-w-[1000px] flex-1 flex flex-col">
              {/* Header Row (Dates) */}
              <div className="flex border-b border-stone-200 bg-stone-50 sticky top-0 z-20">
                <div className="w-48 shrink-0 border-r border-stone-200 p-3 bg-stone-50 sticky left-0 z-30 flex items-end">
                  <span className="text-xs font-semibold text-stone-500 uppercase">Unit / Date</span>
                </div>
                {days.map((day) => (
                  <div 
                    key={day.date} 
                    className={`flex-1 min-w-[80px] p-2 border-r border-stone-200 text-center flex flex-col items-center justify-center
                      ${day.isToday ? 'bg-teal-50/50' : ''}`
                    }
                  >
                    <span className={`text-xs font-medium mb-1 ${day.isToday ? 'text-teal-700' : 'text-stone-500'}`}>
                      {formatDate(day.date, 'EEE')}
                    </span>
                    <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm
                      ${day.isToday ? 'bg-teal-600 text-white font-bold' : 'text-stone-900'}`
                    }>
                      {formatDate(day.date, 'd')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid Rows (Units) */}
              <div className="flex-1 overflow-y-auto">
                {units.length === 0 ? (
                  <div className="p-8 text-center text-stone-500">
                    No units configured for this property.
                  </div>
                ) : (
                  units.map((unit) => (
                    <div key={unit.id} className="flex border-b border-stone-100 group">
                      {/* Unit Column */}
                      <div className="w-48 shrink-0 border-r border-stone-200 p-3 bg-white sticky left-0 z-10 group-hover:bg-stone-50 transition-colors">
                        <p className="font-medium text-stone-900 truncate">{unit.name}</p>
                        <p className="text-xs text-stone-500 truncate">{unit.unit_type} • {unit.capacity} pax</p>
                      </div>

                      {/* Day Cells */}
                      {days.map((day) => {
                        const booking = getBookingForUnitAndDate(unit.id, day.date);
                        const isStart = booking && booking.check_in === day.date;
                        
                        return (
                          <div 
                            key={`${unit.id}-${day.date}`} 
                            className={`flex-1 min-w-[80px] border-r border-stone-100 p-1 relative
                              ${day.isToday ? 'bg-teal-50/20' : ''}`
                            }
                          >
                            {booking && (
                              <div 
                                onClick={() => navigate(`/bookings/${booking.id}`)}
                                className={`
                                  absolute inset-y-1 left-0 right-0 z-10 border rounded-sm p-1.5 cursor-pointer truncate text-xs
                                  ${getStatusColor(booking.status)}
                                  ${isStart ? 'ml-1' : '-ml-[1px] border-l-0 rounded-l-none'}
                                `}
                              >
                                {isStart && (
                                  <span className="font-medium">
                                    {booking.id.substring(0,4)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
