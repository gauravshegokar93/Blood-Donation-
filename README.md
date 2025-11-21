# Blood Bank Management System (Next.js)

This is a web-based Blood Donation Camp Management System built with Next.js, React, Tailwind CSS, and TypeScript. It uses `sessionStorage` for temporary data persistence during a user's session.

## Prerequisites

- Node.js (v20 or later)
- npm or yarn

## Setup

1.  **Install Dependencies:**
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

## Running the Application

Once setup is complete, start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Overview

-   **Frontend**: Built with Next.js and React.
-   **Styling**: Uses Tailwind CSS with ShadCN UI components.
-   **Data Management**: The application uses the browser's `sessionStorage` to simulate a database. Data is organized by camp location and is cleared when the browser tab is closed.
-   **Analytics**: Charting is implemented using Chart.js.

### Key Features

-   **Location-Specific Sessions**: Users select a camp location upon login, and all data within the application is scoped to that location for the duration of the session.
-   **Donor Management**: Includes forms for registering new donors, accepting, and rejecting them.
-   **Blood Bank Management**: Allows for adding and managing blood bank agencies for each camp location.
-   **Dashboards**:
    -   **Admin Dashboard**: Shows live statistics and analytics for the current camp location.
    -   **Director's Dashboard**: Provides a high-level overview of registration data across all locations, combining live data with historical totals.
