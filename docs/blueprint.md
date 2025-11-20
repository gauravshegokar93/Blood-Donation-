# **App Name**: BloodBank Management System

## Core Features:

- User Authentication: Secure login system to manage user access to the application, directing users to the appropriate page.
- Blood Bank Management: Add, edit, delete, and view blood bank information including name, location, counter number, and quota.
- Donor Registration: Register donors with details like name, blood group, mobile number, and associated blood bank.
- Acceptance/Rejection Handling: Mark donors as accepted or rejected with appropriate validation checks to avoid double entries and maintain data integrity.
- Reporting and Statistics: Generate reports including BDC status and history, providing summaries and visualizations (charts) of donation statistics.
- Data Validation: Performs frontend (simple) and backend (extensive) validation to minimize issues with the data collected in forms. Uses Javascript for simple front-end validation and backend validation in Node.js with Express.

## Style Guidelines:

- Primary color: Deep Red (#8B0000) to represent blood donation.
- Background color: Off-White (#FAFAFA) to provide a clean and modern look.
- Accent color: Soft Gray (#778899) for UI elements, ensuring legibility and focus on content.
- Body and headline font: 'PT Sans', sans-serif for both headings and body text for readability and a modern feel.
- Use clear and simple icons for navigation and actions; designed for clarity and ease of use.
- Responsive design adapts to different screen sizes; primarily optimized for desktop but functional on smaller screens.
- Subtle animations when updating data or navigating to new sections, to confirm user actions with feedback and improve the UX.