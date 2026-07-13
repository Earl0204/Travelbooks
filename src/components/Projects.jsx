import { useState } from 'react';

export default function Projects({ 
  tasks, 
  bookings, 
  onAddTaskClick, 
  onEditTaskClick, 
  onDeleteTask, 
  onMoveTask 
}) {
  const [selectedBookingFilter, setSelectedBookingFilter] = useState('All');

  // Drag and Drop handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, targetStatus);
    }
  };

  // Filter tasks by booking reference
  const filteredTasks = tasks.filter((task) => {
    if (selectedBookingFilter === 'All') return true;
    return task.bookingRef === selectedBookingFilter;
  });

  // Split tasks into lanes
  const columns = [
    { id: 'todo', title: 'Preparation / Pending', dotClass: 'dot-todo' },
    { id: 'in-progress', title: 'In Progress', dotClass: 'dot-progress' },
    { id: 'review', title: 'Quality Check / Review', dotClass: 'dot-review' },
    { id: 'done', title: 'Completed / Ready', dotClass: 'dot-done' }
  ];

  // Get booking name for a task
  const getBookingClientName = (bookingRef) => {
    const booking = bookings.find(b => b.id === bookingRef);
    return booking ? booking.clientName : 'Unknown Client';
  };

  // Move task to next lane sequentially (Fallback / mobile helper)
  const handleAdvanceTask = (task) => {
    const statusSequence = ['todo', 'in-progress', 'review', 'done'];
    const currentIndex = statusSequence.indexOf(task.status);
    if (currentIndex !== -1 && currentIndex < statusSequence.length - 1) {
      onMoveTask(task.id, statusSequence[currentIndex + 1]);
    }
  };

  return (
    <div className="panel active">
      {/* Controls Header */}
      <div className="kanban-controls">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Project Execution Kanban</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Track booking itineraries and prep status. Drag-and-drop cards to update.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Filter by Booking */}
          <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ margin: 0, fontSize: '11px', whiteSpace: 'nowrap' }}>Filter Booking:</label>
            <select
              className="form-control"
              style={{ width: '180px', padding: '6px 12px' }}
              value={selectedBookingFilter}
              onChange={(e) => setSelectedBookingFilter(e.target.value)}
            >
              <option value="All">All Bookings</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.clientName} ({b.destination})
                </option>
              ))}
            </select>
          </div>

          {/* Add Task Trigger */}
          <button className="btn btn-primary" onClick={onAddTaskClick}>
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Kanban Task
          </button>
        </div>
      </div>

      {/* Board Lanes */}
      <div className="kanban-columns">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="column-header">
                <h3 className="column-title">
                  <span className={`column-dot ${col.dotClass}`} />
                  {col.title}
                </h3>
                <span className="task-count">{colTasks.length}</span>
              </div>

              {/* Column Body / Draggable Cards */}
              <div className="column-body">
                {colTasks.length === 0 ? (
                  <div style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px',
                    padding: '24px 12px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    Drag tasks here
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="task-card"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                    >
                      <div className="task-card-header">
                        <span className="task-card-title">{task.title}</span>
                        {/* Quick controls inside card */}
                        <div className="task-actions">
                          {/* Edit */}
                          <button 
                            className="task-action-btn"
                            title="Edit task"
                            onClick={() => onEditTaskClick(task)}
                          >
                            <svg style={{ width: '12px', height: '12px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          
                          {/* Delete */}
                          <button 
                            className="task-action-btn"
                            title="Delete task"
                            onClick={() => onDeleteTask(task.id)}
                          >
                            <svg style={{ width: '12px', height: '12px', stroke: 'var(--status-cancelled)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="task-card-desc">{task.description}</p>

                      <div className="task-card-meta">
                        {/* Booking reference */}
                        <span className="task-booking-ref" title="Client Booking Reference">
                          <svg style={{ width: '10px', height: '10px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {getBookingClientName(task.bookingRef)}
                        </span>

                        {/* Due Date or Next Action */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Due: {task.dueDate || 'No date'}</span>
                          
                          {/* Advance helper for touch/non-drag devices */}
                          {task.status !== 'done' && (
                            <button
                              className="task-action-btn"
                              title="Advance to next step"
                              onClick={() => handleAdvanceTask(task)}
                              style={{ 
                                backgroundColor: 'rgba(255, 162, 0, 0.1)', 
                                color: 'var(--brand-primary)', 
                                padding: '2px 4px', 
                                borderRadius: '4px',
                                fontSize: '9px',
                                fontWeight: 'bold'
                              }}
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
