import { useState } from 'react';

export default function TaskDrawer({ 
  isOpen, 
  onClose, 
  taskToEdit, 
  bookings, 
  onSave 
}) {
  const [formData, setFormData] = useState(() => {
    if (taskToEdit) {
      return {
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        bookingRef: taskToEdit.bookingRef || '',
        status: taskToEdit.status || 'todo',
        dueDate: taskToEdit.dueDate || ''
      };
    } else {
      return {
        title: '',
        description: '',
        // Default to first booking in list if available
        bookingRef: bookings.length > 0 ? bookings[0].id : '',
        status: 'todo',
        dueDate: ''
      };
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.bookingRef) {
      alert("Please fill in the Task Title and associate it with a Booking Reference!");
      return;
    }

    const taskData = {
      ...formData,
      id: taskToEdit ? taskToEdit.id : `TK-${Date.now().toString().slice(-6)}`,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString().slice(0, 10)
    };

    onSave(taskData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background Dimmed Overlay */}
      <div className="drawer-overlay open" onClick={onClose} />
      
      {/* Slide-out Sidebar Form Drawer */}
      <div className="drawer open">
        <div className="drawer-header">
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
            {taskToEdit ? 'Edit Kanban Task' : 'Create Kanban Task'}
          </h2>
          <button className="drawer-close" onClick={onClose} title="Close drawer">
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 70px)' }}>
          <div className="drawer-body">
            {/* Task Title */}
            <div className="form-group">
              <label>Task Title / Activity *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Booking hotel vouchers"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Task Description / Itinerary Notes</label>
              <textarea
                className="form-control"
                style={{ height: '100px', resize: 'none' }}
                placeholder="Enter preparation notes, flight references, or passenger check-in guides."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Booking Reference Selection */}
            <div className="form-group">
              <label>Associate with Booking Reference *</label>
              <select
                className="form-control"
                value={formData.bookingRef}
                onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                required
              >
                <option value="" disabled>Select Booking Reference</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.clientName} - {b.destination} ({b.id})
                  </option>
                ))}
              </select>
              {bookings.length === 0 && (
                <span style={{ fontSize: '11px', color: 'var(--status-cancelled)', marginTop: '4px', display: 'block' }}>
                  ⚠ No active bookings found. Create a booking first!
                </span>
              )}
            </div>

            {/* Lane Status Selection */}
            <div className="form-group">
              <label>Board Column / Status Lane</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="todo">Preparation / Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Quality Check / Review</option>
                <option value="done">Completed / Ready</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label>Target Deadline (Due Date)</label>
              <input
                type="date"
                className="form-control"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Discard Changes
            </button>
            <button type="submit" className="btn btn-primary" disabled={bookings.length === 0}>
              {taskToEdit ? 'Save Task Edits' : 'Confirm & Save Task'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
