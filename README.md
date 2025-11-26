# Blood Donation Camp Management System - Technical Documentation

## 1. Project Overview

This document provides a comprehensive technical specification for the Blood Donation Camp Management System. The system is a modern, web-based application designed to streamline the management of blood donation drives, from donor registration and blood bank coordination to real-time analytics and certificate generation.

The application is built with Next.js, React, and Tailwind CSS, offering a responsive and user-friendly interface. It operates in two primary modes: an **Admin Dashboard** for managing a specific camp location and a **Director's Dashboard** for a high-level overview of all camp locations.

---

## 2. System Architecture

The system is architected as a single-page application (SPA) with a serverless backend, leveraging modern web technologies for a scalable and maintainable solution.

### 2.1 Frontend

*   **Framework**: [Next.js](https://nextjs.org/) (with React) using the App Router.
*   **Language**: [TypeScript](https://www.typescriptlang.org/).
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/) - A collection of accessible and reusable components.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
*   **Charting**: [Chart.js](https://www.chartjs.org/) with `react-chartjs-2` for data visualization.
*   **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`) and `sessionStorage` for persisting session-specific data.

### 2.2 Backend & Data Layer

*   **Primary Data Store (Current)**: The application currently uses the browser's `sessionStorage` to simulate a multi-location database. All data (registrations, blood banks) is scoped to the location selected during login and is cleared when the session ends. This allows for rapid, offline-first development and testing.
*   **API Layer**: A RESTful API is defined using Next.js API Routes (`src/app/api`). Although the frontend currently interfaces with `sessionStorage`, these API endpoints are built to connect to a persistent database like Microsoft SQL Server.
    *   **Database Driver**: `mssql` library is included for future integration.
    *   **Connection Logic**: The `src/lib/db.ts` file contains the configuration and connection pool logic for connecting to an SQL Server instance.

### 2.3 Print Engine

The system features two distinct printing mechanisms:

1.  **Certificate Printing**: Uses the browser's native print functionality (`window.print()`) combined with CSS `@media print` rules. A hidden `<div>` containing the certificate component is made visible only during a print job, ensuring a clean, full-page output.
2.  **Identity Card Printing**: A more complex engine using `html2canvas` and `jspdf`. It renders a React component to a canvas, converts it to a PNG image, and then embeds that image into a precisely sized PDF (85.6mm x 54mm) for printing.

---

## 3. Modules & Features

### 3.1 Registration Module

*   **Functionality**: Allows for creating, reading, updating, and deleting donor registrations for a specific camp location.
*   **Unique ID Generation**: A unique, sequential registration ID is generated for each donor based on the camp location prefix (e.g., `PUN-0001`).
*   **Data Validation**: Includes client-side validation for required fields like mobile number format.
*   **Status Tracking**: Each registration has a status: `REGISTERED`, `ACCEPTED`, or `REJECTED`.

### 3.2 Certificate Generator

*   **Functionality**: Generates and prints official donation certificates for non-rejected donors.
*   **Dynamic Data**: Overlays the donor's name, event details, and date onto a fixed, high-quality background image (`wadhokar-logo.png`).
*   **Print Workflow**:
    1.  User clicks "Preview" to see the certificate in a dialog or "Print" to initiate the print job.
    2.  The selected donor's data is passed to the `<Certificate />` component.
    3.  For printing, this component is rendered into a hidden print-only area.
    4.  `window.print()` triggers the browser's print dialog, and CSS media queries ensure only the certificate is printed.

### 3.3 Dashboard

#### Admin Dashboard (`/dashboard`)

*   **Scope**: Location-specific. Displays live data for the currently selected camp location.
*   **Key Metrics**: Shows total registrations, accepted donors, and rejected donors.
*   **Visualizations**: Includes doughnut charts for Registration Status, Blood Group Distribution, and Registrations by Agency.
*   **Recent Activity**: A list of the most recent registrations and their current status.

#### Director's Dashboard (`/director`)

*   **Scope**: Global. Provides an aggregated view of all camp locations.
*   **BDC Status Report**: Displays a summary bar chart for each location, comparing total, accepted, and rejected registrations.
*   **BDC History Report**: A trend chart showing total registrations year-over-year, combining historical data with live data for the current year.

### 3.4 Reports Module

*   **Functionality**: Centralized in the Director's Dashboard, providing two key reports.
*   **Trend Chart**: Visualizes registration totals from 2010 to the present, clearly distinguishing between historical and live data sources.
*   **Data Table**: A tabular view of the historical data, showing year, total registrations, and data source ('Historical' or 'Live').

### 3.5 Admin Panel

*   **Blood Bank Management**: A CRUD interface to manage blood bank agencies, including their name, assigned counter number, and donation quota for the camp.
*   **Acceptance/Rejection**: Simple interfaces to update a donor's status from `REGISTERED` to either `ACCEPTED` or `REJECTED`. The rejection module requires a reason.
*   **Certification**: A dedicated view to search for donors and generate their certificates.

---

## 4. Data Models

*   **Registration**:
    ```typescript
    interface Registration {
      id: string; // e.g. PUN-0001
      name: string;
      bloodGroup: string;
      mobile: string;
      agency: string;
      location: string;
      year: string; // e.g., '2026-27'
      status: 'REGISTERED' | 'ACCEPTED' | 'REJECTED';
      rejectionReason?: string;
      rejectionDate?: string;
      gender?: 'Male' | 'Female' | 'Other';
      age?: number;
    }
    ```
*   **BloodBank**:
    ```typescript
    interface BloodBank {
      id: number;
      name: string;
      location: string;
      year: string;
      counter: number;
      quota: number;
    }
    ```
*   **HistoricalData**:
    ```typescript
    interface HistoricalData {
      campYear: string;
      totalRegistrations: number;
    }
    ```

---

## 5. Database Structure / Schema

For future MS SQL Server integration, the following table schema is proposed.

```sql
-- Stores information about each registered donor
CREATE TABLE Registrations (
    id NVARCHAR(20) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    bloodGroup NVARCHAR(10) NOT NULL,
    mobile NVARCHAR(15) NOT NULL,
    agency NVARCHAR(255),
    location NVARCHAR(100) NOT NULL,
    year NVARCHAR(10) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'REGISTERED', -- REGISTERED, ACCEPTED, REJECTED
    rejectionReason NVARCHAR(255),
    rejectionDate DATE,
    gender NVARCHAR(10),
    age INT,
    createdAt DATETIME DEFAULT GETDATE()
);

-- Stores information about blood bank agencies associated with camps
CREATE TABLE BloodBanks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    location NVARCHAR(100) NOT NULL,
    year NVARCHAR(10) NOT NULL,
    counter INT,
    quota INT
);

-- Stores historical aggregate data for the Director's Dashboard
CREATE TABLE HistoricalRegistrations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    campYear NVARCHAR(10) NOT NULL UNIQUE,
    totalRegistrations INT NOT NULL
);
```

---

## 6. API Endpoints

The API is defined in `src/app/api/`.

### `/api/blood-banks`

*   **`GET /api/blood-banks?location={location}`**
    *   **Behavior**: Fetches all blood banks for a specified location.
    *   **Output**: `NextResponse.json(BloodBank[])`
*   **`POST /api/blood-banks`**
    *   **Behavior**: Creates a new blood bank or updates an existing one if an `id` is provided in the body.
    *   **Input Body**: `Partial<BloodBank>`
    *   **Output**: `NextResponse.json({ message: string })`
*   **`DELETE /api/blood-banks?id={id}`**
    *   **Behavior**: Deletes a blood bank by its ID.
    *   **Output**: `NextResponse.json({ message: string })`

---

## 7. Front-end Components & Logic

### 7.1 Key Screens & UI Workflow

1.  **Login (`/`)**: User selects a camp location to start a session. This sets the `bdcLocation` in `sessionStorage` and initializes mock data if it's the first time for that session.
2.  **Admin Dashboard (`/dashboard`)**: The central hub for camp admins. Displays key stats and provides navigation to all management modules (Registration, Blood Bank, etc.).
3.  **Registration Page (`/dashboard/registration`)**: A form for adding new donors and a table displaying existing ones. Selecting a donor from the table populates the form for editing or deletion.
4.  **Director's Dashboard (`/director`)**: A read-only view for high-level management, showing data aggregated across all locations and historical trends.

### 7.2 Dashboard Logic

*   **Refresh Behavior**: The Admin Dashboard was initially static. It has been updated to include a `window.addEventListener('focus', ...)` in its `useEffect` hook. This ensures that whenever the user navigates away (e.g., to add a new donor) and returns to the dashboard tab, the `loadDashboardData` function is re-triggered, fetching the latest data from `sessionStorage` and updating all stats and charts.
*   **Data Sources**:
    *   **Admin Dashboard**: Reads directly from `sessionStorage` keys namespaced by location (e.g., `registrations_Pune`).
    *   **Director's Dashboard**: Reads from `sessionStorage` for all defined locations to generate the live "BDC Status" report. For the "BDC History" report, it combines data from `src/lib/historical-data.ts` with live data from `sessionStorage` for the current year.

### 7.3 Certificate Logic

*   **Background**: A high-resolution PNG (`/public/wadhokar-logo.png` is used as a logo, but the certificate itself implies a background image) serves as the static template.
*   **Data Overlay**: The `<Certificate />` component uses CSS `position: absolute` to place the donor's name, date, and event details at precise locations on top of the background.
*   **Print Mode**:
    1.  The main application view has a class `print-hidden`.
    2.  A separate `<div id="print-area">` is hidden by default and has the class `print:block`.
    3.  When `window.print()` is called, CSS `@media print` rules hide everything with `print-hidden` and show only `#print-area`.
    4.  This isolates the certificate for a clean, full-page print without any other UI elements.

### 7.4 Identity Card Print Logic

*   **Technology**: `html2canvas` and `jspdf`.
*   **Workflow**:
    1.  The `<PrintCard />` component is rendered off-screen with the selected donor's data.
    2.  `html2canvas` captures this component and converts it into a high-resolution canvas.
    3.  The canvas is converted to a `PNG` data URI.
    4.  A new `jsPDF` instance is created with a custom format matching a standard ID card size (85.6mm x 54mm, or approx. 3.375 x 2.125 inches).
    5.  The PNG image is added to the PDF, filling the page.
    6.  The PDF is opened in a new tab for printing (`pdf.autoPrint()`).

### 7.5 Historical Data Logic

*   **Data Loading**: The `historicalData` array is statically imported from `src/lib/historical-data.ts`.
*   **Live Data Integration**: In `src/app/director/page.tsx`, the logic first processes the static `historicalData`. It then iterates through all live camp locations in `sessionStorage`, calculates the total registrations for the current year (`2026`), and overwrites the historical value for `2026` with this new live total. This ensures the trend chart always reflects the most current data.

---

## 8. Known Issues & Fixes

1.  **Issue**: The Director's Dashboard was showing inflated historical numbers (multiplied by 16).
    *   **Cause**: The data aggregation logic in `director/page.tsx` was incorrectly written, causing it to loop and multiply historical totals instead of summing them correctly.
    *   **Fix**: The logic was rewritten to correctly process the `historicalData` array and combine it with a separate, accurate calculation for the current year's live data, removing the erroneous multiplication.

2.  **Issue**: The Admin Dashboard did not update after a new registration was created on a different page.
    *   **Cause**: The dashboard's `useEffect` hook ran only on the initial page load.
    *   **Fix**: An event listener for the `focus` event was added to the `window` object inside the `useEffect` hook. A cleanup function removes the listener when the component unmounts. This ensures data is re-fetched every time the user focuses on the dashboard tab.

3.  **Issue**: Build failures due to "Expected '}', got '<eof>'" syntax errors.
    *   **Cause**: During refactoring, closing curly braces `}` for React components were accidentally deleted.
    *   **Fix**: The missing braces were added back to the respective component files (e.g., `src/app/dashboard/page.tsx`), resolving the syntax error.

---

## 9. Future Enhancements

*   **Database Integration**: Fully migrate from `sessionStorage` to a persistent MS SQL Server database by implementing the logic in the existing API routes and `db.ts` file.
*   **User Authentication**: Implement a proper authentication system (e.g., using NextAuth.js or Firebase Auth) to replace the current session-based login. This would allow for user roles (Admin, Director) and secure access.
*   **Real-time Updates**: Integrate a real-time service like WebSockets or Firebase Realtime Database to push updates to all connected clients instantly, removing the need for the focus-based refresh hack.
*   **Advanced Reporting**: Add more detailed reports, such as donor demographics, blood type availability trends, and camp performance comparisons. Allow for exporting reports to CSV or PDF.
*   **Dockerization**: Create a `Dockerfile` to containerize the application for consistent deployments and easier setup.
*   **Unit & Integration Testing**: Implement a testing suite using a framework like Jest and React Testing Library to ensure code quality and prevent regressions.
