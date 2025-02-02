"use client"
import React, { useState } from 'react';
import { DialogHeader, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { Event, User } from '@/app/calendar/[projectId]/page';
import { Input } from '../ui/input';

interface EventDetailsProps {
  event: Event;
  onUpdate: (eventId: string, updateData: Partial<Event>) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  canEdit: boolean;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  onUpdate,
  onDelete,
  canEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.title);

  const handleUpdate = async () => {
    await onUpdate(event._id, { title });
    setIsEditing(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Event Details</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {isEditing ? (
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <p className="text-gray-600">
              {event.allDay
                ? moment(event.start).format('MMMM D, YYYY')
                : `${moment(event.start).format('MMMM D, YYYY h:mm A')} - 
                   ${moment(event.end).format('h:mm A')}`}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Created by: {(event.createdBy as User).username}
            </p>
          </div>
        )}

        {canEdit && !isEditing && (
          <div className="flex gap-2 mt-4">
            <Button onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(event._id)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
};