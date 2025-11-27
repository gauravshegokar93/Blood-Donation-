import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Registration } from '@/lib/mock-data';

// GET all registrations for a specific location
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({ message: 'Location is required' }, { status: 400 });
  }

  try {
    const query = `SELECT * FROM Registrations WHERE location = @location ORDER BY createdAt DESC`;
    const registrations = await executeQuery(query, { location });
    return NextResponse.json(registrations);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch registrations' }, { status: 500 });
  }
}

// POST to create or update a registration
export async function POST(request: Request) {
  try {
    const body: Partial<Registration> = await request.json();
    const { id, name, bloodGroup, mobile, agency, location, year, age, gender, status, rejectionReason, rejectionDate } = body;

    if (!location || !year) {
        return NextResponse.json({ message: 'Location and year are required' }, { status: 400 });
    }

    if (id) {
      // This is an update
      if (status) { // Specific status update (Accept, Reject)
        let query;
        let params: any = { status, id };
        if (status === 'REJECTED') {
            query = `UPDATE Registrations SET status = @status, rejectionReason = @rejectionReason, rejectionDate = @rejectionDate WHERE id = @id`;
            params.rejectionReason = rejectionReason;
            params.rejectionDate = rejectionDate;
        } else {
            query = `UPDATE Registrations SET status = @status WHERE id = @id`;
        }
        await executeQuery(query, params);
        return NextResponse.json({ message: `Registration ${id} status updated to ${status}` });
      } else { // General record update from registration page
         const query = `
            UPDATE Registrations 
            SET name = @name, bloodGroup = @bloodGroup, mobile = @mobile, agency = @agency, age = @age, gender = @gender
            WHERE id = @id`;
         await executeQuery(query, { name, bloodGroup, mobile, agency, age, gender, id });
         return NextResponse.json({ message: 'Registration updated successfully' });
      }
    } else {
      // This is a new registration
      if (!name || !bloodGroup || !mobile || !agency) {
        return NextResponse.json({ message: 'Missing required fields for new registration' }, { status: 400 });
      }

      // Generate the next sequential ID
      const idQuery = `SELECT COUNT(*) as count FROM Registrations WHERE location = @location`;
      const result = await executeQuery(idQuery, { location });
      const count = result[0].count;
      const locationPrefix = location.substring(0, 3).toUpperCase();
      const newId = `${locationPrefix}-${(count + 1).toString().padStart(4, '0')}`;
      
      const query = `
        INSERT INTO Registrations (id, name, bloodGroup, mobile, agency, location, year, age, gender, status) 
        VALUES (@id, @name, @bloodGroup, @mobile, @agency, @location, @year, @age, @gender, 'REGISTERED')`;
      await executeQuery(query, { id: newId, name, bloodGroup, mobile, agency, location, year, age, gender });
      
      return NextResponse.json({ message: 'Registration created successfully', registrationId: newId }, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to save registration' }, { status: 500 });
  }
}

// DELETE a registration
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    try {
        const query = `DELETE FROM Registrations WHERE id = @id`;
        await executeQuery(query, { id });
        return NextResponse.json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to delete registration' }, { status: 500 });
    }
}
