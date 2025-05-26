const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3788d8'
  },
  category: {
    type: String,
    required: false
  },
  recurring: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      required: false
    },
    interval: {
      type: Number,
      required: false
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    endDate: {
      type: Date,
      required: false
    },
    customPattern: {
      type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly']
      },
      interval: Number,
      daysOfWeek: [Number],
      dayOfMonth: Number
    }
  }
});

eventSchema.index({ start: 1, end: 1 });

const EventModel = mongoose.model('Event', eventSchema);

module.exports = { EventModel }; 