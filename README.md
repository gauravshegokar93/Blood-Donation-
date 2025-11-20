# BloodBank Management System

This is a web-based Blood Donation Camp Management System built with Node.js, Express, and vanilla JavaScript, using a Microsoft SQL Server database.

## Prerequisites

- Node.js (v18 or later)
- Microsoft SQL Server

## Setup

1.  **Install Dependencies:**
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

2.  **Database Setup:**
    - Ensure your MS SQL Server instance is running.
    - Create a database for the application (e.g., `BloodBankDB`).
    - Run the following SQL script in your database to create the necessary tables.

    ```sql
    -- Create the BloodBanks table
    CREATE TABLE BloodBanks (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(255) NOT NULL,
        Location NVARCHAR(100) NOT NULL,
        Year INT NOT NULL,
        CounterNo INT,
        QuotaLimit INT,
        CreatedAt DATETIME DEFAULT GETDATE()
    );

    -- Create the Registrations table
    CREATE TABLE Registrations (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(255) NOT NULL,
        BloodGroup NVARCHAR(10) NOT NULL,
        MobileNo NVARCHAR(15) NOT NULL,
        Status NVARCHAR(20) DEFAULT 'REGISTERED' CHECK (Status IN ('REGISTERED', 'ACCEPTED', 'REJECTED', 'DONATED')),
        RejectionReason NVARCHAR(255),
        BloodBankId INT,
        Location NVARCHAR(100) NOT NULL,
        Year INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        FOREIGN KEY (BloodBankId) REFERENCES BloodBanks(Id)
    );

    -- Optional: Insert some sample data for testing

    -- Sample Blood Banks for 2024
    INSERT INTO BloodBanks (Name, Location, Year, CounterNo, QuotaLimit) VALUES
    ('City General Blood Bank', 'Mumbai', 2024, 1, 100),
    ('Red Cross Society', 'Mumbai', 2024, 2, 150),
    ('Community Blood Center', 'Pune', 2024, 1, 120);

    -- Sample Blood Banks for 2023
    INSERT INTO BloodBanks (Name, Location, Year, CounterNo, QuotaLimit) VALUES
    ('LifeLine Blood Services', 'Mumbai', 2023, 1, 80);


    -- Sample Registrations for Mumbai 2024
    INSERT INTO Registrations (Name, BloodGroup, MobileNo, Status, BloodBankId, Location, Year) VALUES
    ('Amit Sharma', 'O+', '9876543210', 'ACCEPTED', 1, 'Mumbai', 2024),
    ('Priya Singh', 'A+', '9876543211', 'REJECTED', 1, 'Mumbai', 2024),
    ('Rohan Verma', 'B+', '9876543212', 'REGISTERED', 2, 'Mumbai', 2024);

    -- Sample Registrations for Pune 2024
    INSERT INTO Registrations (Name, BloodGroup, MobileNo, Status, BloodBankId, Location, Year) VALUES
    ('Sneha Patel', 'AB+', '8765432109', 'ACCEPTED', 3, 'Pune', 2024);
    
    -- Sample Registrations for Mumbai 2023
    INSERT INTO Registrations (Name, BloodGroup, MobileNo, Status, BloodBankId, Location, Year) VALUES
    ('Vikram Rathod', 'B-', '7654321098', 'DONATED', 4, 'Mumbai', 2023);

    ```

3.  **Configure Environment Variables:**
    Create a file named `.env` in the project root. Copy the contents of `.env.example` into it and replace the placeholder values with your actual MS SQL Server credentials.

    ```
    DB_SERVER=localhost
    DB_DATABASE=BloodBankDB
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    ```

## Running the Application

Once setup is complete, start the server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).
