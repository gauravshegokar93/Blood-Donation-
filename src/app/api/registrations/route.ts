
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Registration } from '@/lib/types';

// GET registrations
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const id = searchParams.get('id');

  if (id) {
    // Get a single registration by ID
    try {
      const query = `SELECT * FROM Registrations WHERE id = @id`;
      const result = await executeQuery(query, { id });
      if (result.length === 0) {
        return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Failed to fetch registration' }, { status: 500 });
    }
  }

  if (location) {
    // Get all registrations for a specific location
    try {
      const query = `SELECT * FROM Registrations WHERE location = @location ORDER BY createdAt DESC`;
      const registrations = await executeQuery(query, { location });
      return NextResponse.json(registrations);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Failed to fetch registrations' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Location or ID is required' }, { status: 400 });
}

// POST to create or update a registration
export async function POST(request: Request) {
  try {
    const body: Partial<Registration> = await request.json();
    const { id, name, bloodGroup, mobile, agency, location, year, age, gender, status, rejectionReason } = body;

    if (!location || !year) {
        return NextResponse.json({ message: 'Location and year are required' }, { status: 400 });
    }

    if (id) {
      // This is an update
      let query = `UPDATE Registrations SET`;
      const params: { [key: string]: any } = { id };
      const updates: string[] = [];

      if (name) { updates.push(`name = @name`); params.name = name; }
      if (bloodGroup) { updates.push(`bloodGroup = @bloodGroup`); params.bloodGroup = bloodGroup; }
      if (mobile) { updates.push(`mobile = @mobile`); params.mobile = mobile; }
      if (agency) { updates.push(`agency = @agency`); params.agency = agency; }
      if (age) { updates.push(`age = @age`); params.age = age; }
      if (gender) { updates.push(`gender = @gender`); params.gender = gender; }
      if (status) { 
        updates.push(`status = @status`); 
        params.status = status;
        if (status === 'REJECTED') {
          updates.push(`rejectionReason = @rejectionReason`);
          params.rejectionReason = rejectionReason;
          updates.push(`rejectionDate = @rejectionDate`);
          params.rejectionDate = new Date().toISOString().split('T')[0];
        }
      }
      
      if (updates.length === 0) {
        return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
      }

      query += ` ${updates.join(', ')} WHERE id = @id`;
      await executeQuery(query, params);
      return NextResponse.json({ message: 'Registration updated successfully' });

    } else {
      // This is a new registration
      if (!name || !bloodGroup || !mobile || !agency) {
        return NextResponse.json({ message: 'Missing required fields for new registration' }, { status: 400 });
      }

      // Generate the next sequential ID
      const idQuery = `SELECT COUNT(*) as count FROM Registrations WHERE location = @location`;
      const result = await executeQuery(idQuery, { location });
      const count = result.length > 0 ? result[0].count : 0;
      const locationPrefix = location.substring(0, 3).toUpperCase();
      const newId = `${locationPrefix}-${(count + 1).toString().padStart(4, '0')}`;
      
      const query = `
        INSERT INTO Registrations (id, name, bloodGroup, mobile, agency, location, year, age, gender, status, createdAt) 
        VALUES (@id, @name, @bloodGroup, @mobile, @agency, @location, @year, @age, @gender, 'REGISTERED', GETDATE())`;
      await executeQuery(query, { id: newId, name, bloodGroup, mobile, agency, location, year, age, gender });
      
      return NextResponse.json({ message: 'Registration created successfully', registrationId: newId }, { status: 201 });
    }
  } catch (error) {
    console.error('SQL Error:', error);
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
