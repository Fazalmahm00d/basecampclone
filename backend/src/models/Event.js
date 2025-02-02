// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    start: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value instanceof Date && !isNaN(value);
        },
        message: 'Start date must be a valid date'
      }
    },
    end: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          return value instanceof Date && !isNaN(value);
        },
        message: 'End date must be a valid date'
      }
    },
    allDay: {
      type: Boolean,
      default: false
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    organizationName: {
      type: String,
      ref: 'Account',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model('Event', eventSchema);