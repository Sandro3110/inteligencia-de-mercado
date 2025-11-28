import { NextResponse } from 'next/server';
import { db } from '@/server/lib/drizzle-serverless';
import { users } from '@/drizzle/schema';
import { ne } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // Buscar todos os usuários que não estão approved
    const affectedUsers = await db.select().from(users).where(ne(users.status, 'approved'));
    
    if (affectedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users need fixing',
        count: 0
      });
    }

    // Atualizar todos para approved
    await db.update(users)
      .set({ status: 'approved' })
      .where(ne(users.status, 'approved'));

    return NextResponse.json({
      success: true,
      message: `Fixed ${affectedUsers.length} users`,
      count: affectedUsers.length,
      users: affectedUsers.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        previousStatus: u.status
      }))
    });

  } catch (error: any) {
    console.error('Error fixing all users:', error);
    return NextResponse.json({ 
      error: 'Failed to fix users', 
      details: error.message 
    }, { status: 500 });
  }
}

// GET para verificar quantos usuários precisam de correção
export async function GET() {
  try {
    const affectedUsers = await db.select().from(users).where(ne(users.status, 'approved'));
    
    return NextResponse.json({
      success: true,
      count: affectedUsers.length,
      users: affectedUsers.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status
      }))
    });

  } catch (error: any) {
    console.error('Error checking users:', error);
    return NextResponse.json({ 
      error: 'Failed to check users', 
      details: error.message 
    }, { status: 500 });
  }
}
