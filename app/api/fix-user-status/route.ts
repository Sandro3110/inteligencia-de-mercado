import { NextResponse } from 'next/server';
import { db } from '@/server/lib/drizzle-serverless';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Verificar status atual
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user || user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentUser = user[0];
    
    // Se status não é 'approved', corrigir
    if (currentUser.status !== 'approved') {
      await db.update(users)
        .set({ status: 'approved' })
        .where(eq(users.email, email));
      
      return NextResponse.json({
        success: true,
        message: 'User status updated to approved',
        before: currentUser.status,
        after: 'approved',
        user: {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User already approved',
      user: {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
        status: currentUser.status,
      }
    });

  } catch (error: any) {
    console.error('Error fixing user status:', error);
    return NextResponse.json({ 
      error: 'Failed to fix user status', 
      details: error.message 
    }, { status: 500 });
  }
}
