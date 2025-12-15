import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import {
  setAuthenticationChallenge,
} from '@/lib/webauthn-challenge-store';
import { RP_ID } from '@/lib/webauthn-config';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required to start passkey login' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const normalizedEmail = email.toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });

    const validPasskeys = Array.isArray(user?.passkeys)
      ? user.passkeys.filter(
          (pk: any) => pk.credentialID && pk.credentialPublicKey
        )
      : [];

    if (!user || validPasskeys.length === 0) {
      return NextResponse.json(
        { error: 'No passkeys registered for this user' },
        { status: 404 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      timeout: 60_000,
      userVerification: 'preferred',
      allowCredentials: validPasskeys.map((pk: any) => ({
        id: pk.credentialID as string,
        transports: pk.transports,
      })),
    });

    setAuthenticationChallenge(user._id.toString(), options.challenge);

    return NextResponse.json({ options });
  } catch (error: any) {
    console.error('Passkey login start error:', error);
    return NextResponse.json(
      { error: 'Failed to start passkey login', details: error.message },
      { status: 500 }
    );
  }
}

