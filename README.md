# Student Attendance System

A local-first web application for tracking student attendance in classrooms. Built with vanilla HTML, CSS, and JavaScript — all data stays on the device.

## Features

- **Student Roster**: Add, search, and remove students
- **Daily Attendance**: Mark Present, Absent, or Late for each student per day
- **Dashboard**: Summary statistics at a glance (total students, present/late/absent counts, attendance rate)
- **Historical Records**: View saved days and export to CSV
- **Reports**: Per-student attendance summaries with rates
- **Local Storage**: All data stored in browser's localStorage — no account, no server
- **Responsive**: Works on desktop and mobile

## Quick Start

1. Open `index.html` in a modern browser
2. Add students via the **Students** page
3. Mark attendance on the **Attendance** page
4. View reports and export CSV data

## Technology Stack

- HTML5
- CSS3 with CSS variables
- Vanilla JavaScript (ES6+)
- localStorage for data persistence

## Project Structure

```
day 29/
├── index.html      - Main application shell
├── app.js          - Core logic (110 lines)
└── styles.css      - Styling (118 lines)
```

## How It Works

- Students are stored in `localStorage` under key `attendance_students_v1`
- Attendance records are stored per-date under key `attendance_records_v1`
- Data persists across browser sessions
- CSV export available for backup/analysis

## Keyboard Shortcuts

- `Escape` key: Close sidebar
- Nav buttons: Navigate between dates

## License

MIT — free for personal and educational use.