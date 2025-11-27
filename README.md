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
*   **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`) for managing component state. API calls using `fetch` for data retrieval and mutations.

### 2.2 Backend & Data Layer

*   **Database**: [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server). All application data, including registrations and blood banks, is stored in a persistent SQL database.
*   **API Layer**: A RESTful API is built using Next.js API Routes (`src/app/api`). These endpoints serve as the bridge between the frontend application and the SQL Server database.
    *   **Database Driver**: The `mssql` library is used to establish and manage the connection to the SQL Server instance.
    *   **Connection Logic**: The `src/lib/db.ts` file contains the configuration and a connection pool for efficiently handling database queries.

### 2.3 Print Engine

The system features two distinct printing mechanisms:

1.  **Certificate Printing**: Uses the browser's native print functionality (`window.print()`) combined with CSS `@media print` rules. A hidden `<div>` containing the certificate component is made visible only during a print job, ensuring a clean, full-page output.
2.  **Identity Card Printing**: A more complex engine using `html2canvas` and `jspdf`. It renders a React component to a canvas, converts it to a PNG image, and then embeds that image into a precisely sized PDF (85.6mm x 54mm) for printing.

---

## 3. Modules & Features

### 3.1 Registration Module

*   **Functionality**: Allows for creating, reading, updating, and deleting donor registrations for a specific camp location via API calls to the SQL backend.
*   **Unique ID Generation**: A unique, sequential registration ID is generated on the server for each new donor based on the camp location.
*   **Data Validation**: Includes client-side validation for required fields like mobile number format, with primary validation occurring on the backend.
*   **Status Tracking**: Each registration has a status: `REGISTERED`, `ACCEPTED`, or `REJECTED`, which is updated in the database.

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

*   **Scope**: Location-specific. Displays live data for the currently selected camp location, fetched from the SQL database.
*   **Key Metrics**: Shows total registrations, accepted donors, and rejected donors.
*   **Visualizations**: Includes doughnut charts for Registration Status, Blood Group Distribution, and Registrations by Agency.
*   **Recent Activity**: A list of the most recent registrations and their current status.

#### Director's Dashboard (`/director`)

*   **Scope**: Global. Provides an aggregated view of all camp locations, with all data fetched from the SQL database.
*   **BDC Status Report**: Displays a summary bar chart for each location, comparing total, accepted, and rejected registrations.
*   **BDC History Report**: A trend chart showing total registrations year-over-year, combining historical data with live data for the current year from the database.

### 3.4 Reports Module

*   **Functionality**: Centralized in the Director's Dashboard, providing two key reports.
*   **Trend Chart**: Visualizes registration totals from 2010 to the present, clearly distinguishing between historical and live data sources.
*   **Data Table**: A tabular view of the historical data, showing year, total registrations, and data source ('Historical' or 'Live').

### 3.5 Admin Panel

*   **Blood Bank Management**: A CRUD interface to manage blood bank agencies, including their name, assigned counter number, and donation quota for the camp. All operations are performed via API calls.
*   **Acceptance/Rejection**: Simple interfaces to update a donor's status from `REGISTERED` to either `ACCEPTED` or `REJECTED` in the database. The rejection module requires a reason.
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

The MS SQL Server integration uses the following table schema.

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

### `/api/registrations`

*   **`GET /api/registrations?location={location}`**
    *   **Behavior**: Fetches all registrations for a specified location from the `Registrations` table.
    *   **Output**: `NextResponse.json(Registration[])`
*   **`POST /api/registrations`**
    *   **Behavior**: Creates a new registration or updates an existing one in the `Registrations` table. If an `id` is provided, it's an update; otherwise, it's a creation, and a new sequential ID is generated.
    *   **Input Body**: `Partial<Registration>`
    *   **Output**: `NextResponse.json({ message: string, registrationId?: string })`
*   **`DELETE /api/registrations?id={id}`**
    *   **Behavior**: Deletes a registration from the `Registrations` table by its ID.
    *   **Output**: `NextResponse.json({ message: string })`

### `/api/blood-banks`

*   **`GET /api/blood-banks?location={location}`**
    *   **Behavior**: Fetches all blood banks for a specified location from the `BloodBanks` table.
    *   **Output**: `NextResponse.json(BloodBank[])`
*   **`POST /api/blood-banks`**
    *   **Behavior**: Creates a new blood bank or updates an existing one in the `BloodBanks` table.
    *   **Input Body**: `Partial<BloodBank>`
    *   **Output**: `NextResponse.json({ message: string })`
*   **`DELETE /api/blood-banks?id={id}`**
    *   **Behavior**: Deletes a blood bank from the `BloodBanks` table by its ID.
    *   **Output**: `NextResponse.json({ message: string })`

---

## 7. Front-end Components & Logic

### 7.1 Key Screens & UI Workflow

1.  **Login (`/`)**: User selects a camp location to start a session. This sets the `bdcLocation` in `sessionStorage`, which is used in subsequent API calls.
2.  **Admin Dashboard (`/dashboard`)**: The central hub for camp admins. Fetches and displays key stats and charts by calling the backend APIs.
3.  **Registration Page (`/dashboard/registration`)**: A form for adding new donors and a table displaying existing ones. All CRUD operations are performed via `fetch` calls to `/api/registrations`.
4.  **Director's Dashboard (`/director`)**: A read-only view for high-level management, fetching aggregated data from the backend APIs.

### 7.2 Dashboard Logic

*   **Refresh Behavior**: The Admin Dashboard includes a `window.addEventListener('focus', ...)` in its `useEffect` hook. This ensures that whenever the user navigates away and returns, the dashboard data is re-fetched from the APIs, providing live updates.
*   **Data Sources**:
    *   **Admin Dashboard**: Reads all data by making `fetch` requests to the `/api/registrations` and `/api/blood-banks` endpoints.
    *   **Director's Dashboard**: Fetches data for all locations to generate the "BDC Status" report. For the "BDC History" report, it combines data from `src/lib/historical-data.ts` with live data fetched from the backend.

### 7.3 Certificate Logic

*   **Background**: A high-resolution PNG (`/public/wadhokar-logo.png`) is used as a logo, but the certificate itself implies a background image.
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
*   **Live Data Integration**: In `src/app/director/page.tsx`, the logic first processes the static `historicalData`. It then iterates through all defined locations, makes API calls to get the total live registrations for the current year, and overwrites the historical value for that year with this new live total.

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

---

## SQL Migration: Full File Path Change List

This section provides a complete list of file changes required to migrate the application from a `sessionStorage`-based mock backend to a full Microsoft SQL Server backend.

### File Change Table

| File Path | Action | Purpose of Change | Instructions |
| :--- | :--- | :--- | :--- |
| **Backend & API** | | | |
| `src/app/api/registrations/route.ts`| **NEW** | Create a new API route for all Registration CRUD operations. | Implement GET, POST, DELETE methods to interact with the `Registrations` SQL table. |
| `src/app/api/blood-banks/route.ts` | **UPDATE** | Connect existing API route to the SQL database. | Replace mock logic with `executeQuery` calls to the `BloodBanks` SQL table. |
| `src/lib/db.ts` | **UPDATE** | Configure SQL Server connection details. | Add your database server, user, password, and database name to the config. |
| `src/lib/mock-data.ts` | **DELETE** | Remove the mock data source and initialization logic. | This file is no longer needed as all data will come from the SQL database. |
| **Frontend Components** | | | |
| `src/app/dashboard/page.tsx` | **UPDATE** | Replace `sessionStorage` with API calls. | Refactor `loadDashboardData` to `fetch` from `/api/registrations` and `/api/blood-banks`. |
| `src/app/dashboard/registration/page.tsx`| **UPDATE** | Replace all `sessionStorage` logic with API calls. | Change `loadDataForCamp`, `handleSaveRegistration`, and `handleDelete` to use `fetch`. |
| `src/app/dashboard/blood-bank/page.tsx` | **UPDATE** | Replace all `sessionStorage` logic with API calls. | Change `loadBloodBanks`, `handleSave`, and `handleDelete` to use `fetch`. |
| `src/app/dashboard/acceptance/page.tsx`| **UPDATE** | Replace `sessionStorage` with an API call. | Change `handleAccept` to make a POST request to `/api/registrations` to update the status. |
| `src/app/dashboard/rejection/page.tsx` | **UPDATE** | Replace `sessionStorage` with an API call. | Change `handleReject` to make a POST request to `/api/registrations` to update the status. |
| `src/app/dashboard/certification/page.tsx`| **UPDATE** | Replace `sessionStorage` with an API call. | Fetch donor data from `/api/registrations` for searching and printing. |
| `src/app/director/page.tsx` | **UPDATE** | Replace `sessionStorage` with API calls. | Fetch live data for all locations by making multiple calls to the backend APIs. |
| `src/app/page.tsx` | **UPDATE** | Remove mock data initialization. | The `handleStart` function should no longer call `initializeMockData`. |

### Migration Guide

**Step 1: Apply Backend File Changes**

1.  **Create API Route:** Create the new file `src/app/api/registrations/route.ts` to handle registration data.
2.  **Update API Route:** Modify `src/app/api/blood-banks/route.ts` to fetch data from the `BloodBanks` table in your SQL database instead of mock data.
3.  **Delete Mock Data:** Remove the file `src/lib/mock-data.ts`. The `Registration` and `BloodBank` type definitions should be moved to a new types file (e.g., `src/lib/types.ts`).

**Step 2: Update Frontend Components**

1.  **Refactor Pages:** Go through each file listed in the table under "Frontend Components" (`dashboard/page.tsx`, `registration/page.tsx`, etc.).
2.  **Remove `sessionStorage`:** Delete all code that reads from or writes to `sessionStorage` (e.g., `sessionStorage.getItem('registrations_...')`).
3.  **Implement `fetch`:** Replace the deleted `sessionStorage` logic with `fetch` calls to your new API routes (`/api/registrations`, `/api/blood-banks`). Use `useState` and `useEffect` to manage the data received from the API.

**Step 3: Update Environment Variables**

1.  **Create `.env.local`:** If it doesn't exist, create a `.env.local` file in the root of your project.
2.  **Add Credentials:** Add your SQL Server connection details to this file:
    ```
    DB_SERVER=your_server_address
    DB_USER=your_username
    DB_PASSWORD=your_password
    DB_DATABASE=your_database_name
    DB_OPTIONS_TRUSTSERVERCERTIFICATE=true
    ```

**Step 4: Test SQL Connectivity**

1.  Run the application (`npm run dev`).
2.  Navigate to a page that fetches data, like the Blood Bank management screen.
3.  Verify that the data displayed is coming directly from your SQL database. Check the terminal for any connection error messages from `src/lib/db.ts`.

**Step 5: Verify All Routes**

1.  **Test CRUD Operations:** Systematically test every feature:
    *   Create, edit, and delete a blood bank.
    *   Create, edit, and delete a donor registration.
    *   Accept and reject a donor.
    *   Generate a certificate.
2.  **Check Dashboards:** Ensure both the Admin and Director dashboards display the correct aggregated data from the SQL backend.
