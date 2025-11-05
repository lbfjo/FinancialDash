import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { authRateLimiter } from '@/lib/rate-limiter'
import { handleError, ConflictError, safeJsonParse } from '@/lib/errors'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = authRateLimiter.check(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await safeJsonParse(request)

    // Validate and sanitize input
    const validation = await import('@/lib/validation').then(m => m.validateData(m.registerSchema, body))
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data!

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleError(error, 'POST /api/auth/register')
  }
}
