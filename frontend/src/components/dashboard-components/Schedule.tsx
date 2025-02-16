"use client"
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton";
import CustomCalendar from '../ui/CustomCalendar';
import { toast } from 'sonner';

interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  project: { name: string };
  createdBy: { username: string };
}

export default function Schedule() {
  const [events, setEvents] = useState<Event[]>([]);
  const user = useSelector((state: RootState) => state.user);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!user) return;

        const response = await axios.get<Event[]>(`http://localhost:5000/api/event/accounts/${user.organizationName}/events`);
        setEvents(response.data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    const eventsOnDate = events.filter(event => {
      const selectedDateString = date.toDateString();
      const eventStartString = event.start.toDateString();
      const eventEndString = event.end.toDateString();
    
      return selectedDateString >= eventStartString && selectedDateString <= eventEndString;
    });
    
    if (eventsOnDate.length > 0) {
      eventsOnDate.forEach(event => {
        toast(`📅 Event: ${event.title}`, {
          description: `🕒 ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}\n🏢 Project: ${event.project.name}\n👤 Created by: ${event.createdBy.username}`,
          duration: 5000,
        });
      });
    } else {
      toast("No events on this date", {
        description: "Try selecting another date!",
        duration: 3000,
      });
    }
  };

  const eventDates = events.reduce((acc, event) => {
    const currentDate = new Date(event.start);
    while (currentDate <= event.end) {
      acc.set(currentDate.toDateString(), true);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return acc;
  }, new Map<string, boolean>());

  const upcomingEvents = events.filter(event => new Date(event.end) >= new Date());

  if (loading) {
    return (
      <div className="p-4 flex flex-col h-fit justify-center sm:flex-row animate-in">
        <div className="w-full sm:w-2/3 pr-4">
          <h2 className="font-bold mb-4 text-center sm:text-left">Your Schedule</h2>
          <Skeleton className="h-[350px] w-full rounded-lg" />
        </div>
        
        <div className="w-full sm:w-1/3 pl-4">
          <h3 className="font-bold mb-2 text-center sm:text-left">Upcoming Events</h3>
          <div className="h-80 space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col h-fit justify-center sm:flex-row">
      <div className="w-full sm:w-2/3 pr-4">
        <h2 className="font-bold mb-4 text-center sm:text-left">Your Schedule</h2>
        <CustomCalendar 
          selected={selectedDate}
          onSelect={handleDateSelect}
          highlightedDates={Array.from(eventDates.keys()).map(date => new Date(date))}
        />
      </div>
      
      {selectedEvent && (
        <div className="w-full sm:w-1/3 border p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">{selectedEvent.title}</h3>
          <p>Project: {selectedEvent.project.name}</p>
          <p>Created By: {selectedEvent.createdBy.username}</p>
          <p>Start: {selectedEvent.start.toLocaleString()}</p>
          <p>End: {selectedEvent.end.toLocaleString()}</p>
        </div>
      )}
      <div className="w-full sm:w-1/3 pl-4 ">
        <h3 className="font-bold mb-2 text-center sm:text-left">Upcoming Events</h3>
        <div className='h-80 overflow-y-auto'>
          {upcomingEvents.length>0 ? upcomingEvents?.map(event => (
            <div 
              key={event._id} 
              className="border-b py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedEvent(event)}
            >
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-gray-600">
                {event.start.toLocaleDateString()} - {event.end.toLocaleDateString()}
              </p>
            </div>
          )): <p>No event found</p>}
        </div>
      </div>
    </div>
  );
}