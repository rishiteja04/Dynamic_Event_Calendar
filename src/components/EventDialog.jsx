import React, { useState, useEffect } from 'react';

function EventDialog({ event, onClose, onSave, onSaveConfirm, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    allDay: false,
    color: '#3788d8',
    category: '',
    recurring: {
      frequency: 'none',
      interval: 1,
      daysOfWeek: [],
      endDate: null,
      customPattern: {
        type: 'daily',
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: 1
      }
    }
  });

  useEffect(() => {
    if (event) {
      const formattedEvent = {
        ...event,
        start: event.start ? new Date(event.start).toISOString().slice(0, 16) : '',
        end: event.end ? new Date(event.end).toISOString().slice(0, 16) : '',
        recurring: {
          ...(event.recurring || {
            frequency: 'none',
            interval: 1,
            daysOfWeek: [],
            endDate: null,
            customPattern: {
              type: 'daily',
              interval: 1,
              daysOfWeek: [],
              dayOfMonth: 1
            }
          }),
          endDate: event.recurring?.endDate ? new Date(event.recurring.endDate).toISOString().slice(0, 10) : null
        }
      };
      setFormData(formattedEvent);
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start || !formData.end) {
      alert('Please fill in all required fields');
      return;
    }

    const formattedEvent = {
      ...formData,
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
      recurring: {
        ...formData.recurring,
        endDate: formData.recurring.endDate ? new Date(formData.recurring.endDate).toISOString() : null
      }
    };

    onSave(formattedEvent);
    onSaveConfirm();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecurringChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      recurring: {
        ...prev.recurring,
        [field]: value
      }
    }));
  };

  const handleDaysOfWeekChange = (day) => {
    setFormData(prev => ({
      ...prev,
      recurring: {
        ...prev.recurring,
        daysOfWeek: prev.recurring.daysOfWeek.includes(day)
          ? prev.recurring.daysOfWeek.filter(d => d !== day)
          : [...prev.recurring.daysOfWeek, day]
      }
    }));
  };

  const handleCustomPatternChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      recurring: {
        ...prev.recurring,
        customPattern: {
          ...prev.recurring.customPattern,
          [field]: value
        }
      }
    }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            {event?.id ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start *</label>
                <input
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.start}
                  onChange={(e) => handleInputChange('start', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End *</label>
                <input
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.end}
                  onChange={(e) => handleInputChange('end', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="allDay"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.allDay}
                onChange={(e) => handleInputChange('allDay', e.target.checked)}
              />
              <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                All Day Event
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Meeting, Personal, Work"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input
                  type="color"
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Recurring Event</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.recurring.frequency}
                onChange={(e) => handleRecurringChange('frequency', e.target.value)}
              >
                <option value="none">No Recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.recurring.frequency !== 'none' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Repeat Every</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.recurring.interval}
                      onChange={(e) => handleRecurringChange('interval', parseInt(e.target.value))}
                    />
                    <span className="text-gray-500">
                      {formData.recurring.frequency === 'daily' ? 'days' :
                       formData.recurring.frequency === 'weekly' ? 'weeks' :
                       formData.recurring.frequency === 'monthly' ? 'months' : 'units'}
                    </span>
                  </div>
                </div>

                {formData.recurring.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Repeat On</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          className={`px-2 py-1 rounded-md text-sm ${
                            formData.recurring.daysOfWeek.includes(index)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => handleDaysOfWeekChange(index)}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.recurring.frequency === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.recurring.customPattern.dayOfMonth}
                      onChange={(e) => handleCustomPatternChange('dayOfMonth', parseInt(e.target.value))}
                    />
                  </div>
                )}

                {formData.recurring.frequency === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Custom Pattern Type</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.recurring.customPattern.type}
                        onChange={(e) => handleCustomPatternChange('type', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Custom Interval</label>
                      <input
                        type="number"
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.recurring.customPattern.interval}
                        onChange={(e) => handleCustomPatternChange('interval', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.recurring.endDate || ''}
                    onChange={(e) => handleRecurringChange('endDate', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-end space-x-2">
              {event?.id && (
                <button
                  type="button"
                  className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
              <button
                type="submit"
                className="px-3 md:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventDialog; 