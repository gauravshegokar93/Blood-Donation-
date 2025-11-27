import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { BloodBank } from '@/lib/types';

// GET all blood banks for a specific location
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({ message: 'Location is required' }, { status: 400 });
  }

  try {
    const query = `SELECT * FROM BloodBanks WHERE location = @location`;
    const bloodBanks = await executeQuery(query, { location });
    return NextResponse.json(bloodBanks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch blood banks' }, { status: 500 });
  }
}

// POST to create or update a blood bank
export async function POST(request: Request) {
  try {
    const body: Partial<BloodBank> = await request.json();
    const { id, name, location, year, counter, quota } = body;

    if (!name || !location || !year) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (id) {
      // Update existing record
      const query = `
        UPDATE BloodBanks 
        SET name = @name, counter = @counter, quota = @quota 
        WHERE id = @id AND location = @location AND year = @year`;
      await executeQuery(query, { name, counter: counter || 0, quota: quota || 0, id, location, year });
      return NextResponse.json({ message: 'Blood bank updated successfully' });
    } else {
      // Create new record
      const query = `
        INSERT INTO BloodBanks (name, location, year, counter, quota) 
        VALUES (@name, @location, @year, @counter, @quota)`;
      await executeQuery(query, { name, location, year, counter: counter || 0, quota: quota || 0 });
      return NextResponse.json({ message: 'Blood bank created successfully' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to save blood bank' }, { status: 500 });
  }
}

// DELETE a blood bank
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    try {
        const query = `DELETE FROM BloodBanks WHERE id = @id`;
        await executeQuery(query, { id: parseInt(id) });
        return NextResponse.json({ message: 'Blood bank deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to delete blood bank' }, { status: 500 });
    }
}
