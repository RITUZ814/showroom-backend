const express = require('express');
const router = express.Router();
const { Attendance, Task } = require('../models/schema');

// 1. CLOCK IN: Captures timestamp and entry GPS location
router.post('/attendance/clock-in', async (req, res) => {
  try {
    const { userId, date, time, location } = req.body; // location: { latitude, longitude, accuracy }

    const newAttendance = new Attendance({
      employee: userId,
      date, // YYYY-MM-DD
      loginTime: time,
      loginLocation: location
    });

    await newAttendance.save();
    res.status(201).json({ success: true, message: 'Clock-in recorded with GPS coordinates.', data: newAttendance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing clock-in.', error: error.message });
  }
});

// 2. ASSIGN TASK: Allows managers to assign tasks for Today or Tomorrow with a deadline
router.post('/tasks/assign', async (req, res) => {
  try {
    const { title, description, assignedTo, assignedBy, dateForTask, deadline } = req.body;

    const newTask = new Task({
      title,
      description,
      assignedTo,
      assignedBy,
      dateForTask, // e.g. "2026-05-18"
      deadline,     // ISO Date String with specific hour cutoff
      status: 'Pending'
    });

    await newTask.save();
    res.status(201).json({ success: true, message: 'Task assigned successfully.', data: newTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error assigning task.', error: error.message });
  }
});

// 3. MANDATORY CLOCK OUT: Updates task statuses, logs shift notes, and captures ending GPS location
router.post('/attendance/clock-out', async (req, res) => {
  try {
    const { userId, date, logoutTime, location, taskUpdates, shiftSummary } = req.body;
    // taskUpdates: { "taskId1": "Completed", "taskId2": "In Progress" }

    // Step A: Update all task statuses in the database
    const taskIds = Object.keys(taskUpdates);
    for (let taskId of taskIds) {
      await Task.findByIdAndUpdate(taskId, {
        status: taskUpdates[taskId],
        employeeNotesOnLogout: shiftSummary
      });
    }

    // Step B: Update the attendance record with checkout time and location
    const attendanceRecord = await Attendance.findOne({ employee: userId, date: date, logoutTime: { $exists: false } });
    if (!attendanceRecord) {
      return res.status(404).json({ success: false, message: 'Active shift record not found for today.' });
    }

    attendanceRecord.logoutTime = logoutTime;
    attendanceRecord.logoutLocation = location;
    await attendanceRecord.save();

    res.status(200).json({ success: true, message: 'Tasks updated and shift closed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing clock-out and task batch updates.', error: error.message });
  }
});

module.exports = router;