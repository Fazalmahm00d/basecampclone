"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer,ToolbarProps  } from 'react-big-calendar';
import moment from 'moment';
import { Dialog } from '@/components/ui/dialog';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { AddEventForm } from '@/components/calendar-components/AddEventForm';
import { EventDetails } from '@/components/calendar-components/EventDetails';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { toast } from '@/hooks/use-toast';

const localizer = momentLocalizer(moment);
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

export interface Project {
  _id: string;
  name: string;
  account: string;
  members: string[];
}

export interface Account {
  _id: string;
  name: string;
  admin: string;
  members: string[];
  projects: string[];
}

export interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  project: string | Project;
  account: string | Account;
  createdBy: string | User;
}

// Custom toolbar component

const CustomToolbar: React.FC<ToolbarProps<object>> = ({ onNavigate, onView, label, view })=> {

  return (
    <div className="flex flex-wrap sm:flex-nowrap justify-between items-center p-4 border-b">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onNavigate('PREV')}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onNavigate('TODAY')}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onNavigate('NEXT')}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Next
        </button>
      </div>

      <span className="text-xl font-semibold">{label}</span>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onView('month')}
          className={`px-4 py-2 border rounded ${
            view === 'month' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => onView('week')}
          className={`px-4 py-2 border rounded ${
            view === 'week' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => onView('day')}
          className={`px-4 py-2 border rounded ${
            view === 'day' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
          }`}
        >
          Day
        </button>
      </div>
    </div>
  );
};


const DailyEventsList = ({ events, onEventClick }: { 
    events: Event[], 
    onEventClick: (event: Event) => void 
  }) => {
    return (
      <div className="bg-white rounded-lg shadow p-4 mt-4">
        <h3 className="text-lg font-semibold mb-4">
          Events for {events.length > 0 ? moment(events[0].start).format('MMMM D, YYYY') : 'Selected Date'}
        </h3>
        {events.length === 0 ? (
          <p className="text-gray-500">No events scheduled for this date</p>
        ) : (
          <div className="space-y-2">
            {events.sort((a, b) => moment(a.start).valueOf() - moment(b.start).valueOf()).map((event) => (
              <div 
                key={event._id} 
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {event.allDay 
                      ? 'All Day' 
                      : `${moment(event.start).format('h:mm A')} - ${moment(event.end).format('h:mm A')}`}
                  </p>
                </div>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

const ProjectCalendarView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const user = useSelector((state: RootState) => state.user);
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router=useRouter();
  const [view, setView] = useState('month');
const [date, setDate] = useState(new Date());

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };
  
  const handleViewChange = (newView: string) => {
    setView(newView);
  };
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (!user?.email) return;
        
        const response = await axios.get<{ userId: string }>(`https://basecamp-c3ay.onrender.com/api/users/user-id?email=${user.email}`);
        setUserId(response.data.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    
    fetchUserId().then(() => {
      if (projectId) {
        fetchProjectData();
        fetchEvents();
        console.log(events,"events")
      }
    });
  }, [projectId, user?.email]);

  const fetchProjectData = async () => {
    try {
      const projectRes = await fetch(`https://basecamp-c3ay.onrender.com/api/projects/org/${projectId}`);
      const projectData = await projectRes.json();
      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const updateSelectedDateEvents = (date: Date) => {
    const dayEvents = events.filter(event => {
      const eventDate = moment(event.start);
      return eventDate.isSame(moment(date), 'day');
    });
    console.log(dayEvents,"day events")
    setSelectedDateEvents(dayEvents);
    setSelectedDate(date);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    updateSelectedDateEvents(start);
    setSelectedDate(start);
  };

  // Frontend: ProjectCalendarView.tsx (relevant part)

const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/event/projects/${projectId}/events`);
      const data = await response.json();
      console.log(data,"events data")
      // Check if data is an array before mapping
      if (!Array.isArray(data)) {
        console.error('Expected array of events, received:', data);
        setEvents([]);
        return;
      }
      
      const formattedEvents = data.map((event: Event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      console.log(formattedEvents,"formatted events")
      setEvents(formattedEvents);
      console.log(events,"events set")
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAdd = async (eventData: Partial<Event>) => {
    try {
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/event/projects/${projectId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          userId,
          organizationName:user.organizationName,
          start: eventData.start?.toISOString(),
          end: eventData.end?.toISOString()
        }),
      });
      
      if (response.ok) {
        await fetchEvents();
        setIsAddEventOpen(false);
        toast({title:"Event added successfully"})
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title:"Event added successfully",
        variant:"destructive"
      })
    }
  };

  const handleEventUpdate = async (eventId: string, updateData: Partial<Event>) => {
    try {
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/event/projects/${projectId}/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updateData,
          start: updateData.start?.toISOString(),
          end: updateData.end?.toISOString()
        }),
      });
      
      if (response.ok) {
        await fetchEvents();
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const response = await fetch(`https://basecamp-c3ay.onrender.com/api/event/projects/${projectId}/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchEvents();
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-6"
                >
                    ← Back to Project Dashboard
                </Button>
            </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {project?.name} - Calendar
          </h1>
          {user && (
            <p className="text-gray-600">
              Organization: {user.organizationName}
            </p>
          )}
        </div>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogTrigger><Button>Add event</Button></DialogTrigger>
        <AddEventForm
          selectedDate={selectedDate}
          onSubmit={handleEventAdd}
          onCancel={() => setIsAddEventOpen(false)}
          project={project}
        />
      </Dialog>
      </div>
      

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading calendar...</p>
        </div>
      ) : (
        <div className="flex-1">
          <div className="h-[60vh] w-fit sm:w-full">
            <Calendar
                view={view as any}
                onView={handleViewChange}
                date={date}
                onNavigate={handleNavigate}
                components={{
                  toolbar: CustomToolbar as React.ComponentType<ToolbarProps>,
                }}
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', width:'70%'}}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={(event) => setSelectedEvent(event)}
              views={['month', 'week', 'day']}
              defaultView="month"
            />
          </div>
          
          {/* Daily Events List */}
          {selectedDate && (
            <DailyEventsList 
              events={selectedDateEvents}
              onEventClick={(event) => setSelectedEvent(event)}
            />
          )}
        </div>
      )}


      

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onUpdate={handleEventUpdate}
            onDelete={handleEventDelete}
            canEdit={userId === (selectedEvent.createdBy as User)?._id}
          />
        )}
      </Dialog>
    </div>
  );
};

export default ProjectCalendarView;