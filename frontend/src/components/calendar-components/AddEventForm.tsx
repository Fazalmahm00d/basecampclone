"use client"
import React from 'react';
import { useForm } from 'react-hook-form';
import { DialogHeader, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Account } from '@/app/calendar/[projectId]/page';

interface EventFormData {
  title: string;
  date: string; // Assuming this is in "YYYY-MM-DD" format
  startTime?: string; // Optional: "HH:MM" format
  endTime?: string; // Optional: "HH:MM" format
}


interface Project {
    _id: string;
    name: string;
    account: string;
    members: string[];
  }
 interface User {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
  }
  
interface Event {
    _id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    project: string | Project;
    account: string | Account;
    createdBy: string | User;
  }
interface AddEventFormProps {
  selectedDate: Date | null;
  onSubmit: (event: Partial<Event>) => Promise<void>;
  onCancel: () => void;
  project: Project | null;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  project?: string;
}


export const AddEventForm: React.FC<AddEventFormProps> = ({
  selectedDate,
  onSubmit,
  onCancel,
  project
}) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      title: '',
      date: selectedDate?.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      allDay: false
    }
  });

  const isAllDay = watch('allDay');

  const handleFormSubmit = (data: EventFormData) => {
    const event: CalendarEvent = {
      title: data.title,
      start: new Date(`${data.date}T${isAllDay ? "00:00" : data.startTime || "00:00"}`),
      end: new Date(`${data.date}T${isAllDay ? "23:59" : data.endTime || "23:59"}`),
      allDay: isAllDay,
      project: project?._id
    };
  
    onSubmit(event);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Event</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Event Title</label>
          <Input
            {...register('title', { required: true })}
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            {...register('date')}
            type="date"
            defaultValue={selectedDate?.toISOString().split('T')[0]}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox {...register('allDay')} id="allDay" />
          <label htmlFor="allDay" className="text-sm font-medium">
            All day event
          </label>
        </div>

        {!isAllDay && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <Input {...register('startTime')} type="time" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <Input {...register('endTime')} type="time" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Add Event
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};