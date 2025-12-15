import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import {
  setRegistrationChallenge,
} from '@/lib/webauthn-challenge-store';
import { RP_ID, RP_NAME } from '@/lib/webauthn-config';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required to register a passkey' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const normalizedEmail = email.toLowerCase();

    let user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user) {
      const newUser = {
        name: name || normalizedEmail,
        email: normalizedEmail,
        password: null,
        passkeys: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const result = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    const passkeys = Array.isArray(user.passkeys) ? user.passkeys : [];

    const opts: GenerateRegistrationOptionsOpts = {
      rpID: RP_ID,
      rpName: RP_NAME,
      // simplewebauthn v13+ requires userID to be binary, not string
      userID: Buffer.from(user._id.toString(), 'utf8'),
      userName: user.email,
      userDisplayName: user.name || user.email,
      timeout: 60_000,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
      },
      excludeCredentials: passkeys.map((pk: any) => ({
        id: pk.credentialID as string,
        transports: pk.transports,
      })),
    };

    const options = await generateRegistrationOptions(opts);
    setRegistrationChallenge(user._id.toString(), options.challenge);

    return NextResponse.json({ options });
  } catch (error: any) {
    console.error('Passkey register start error:', error);
    return NextResponse.json(
      { error: 'Failed to start passkey registration', details: error.message },
      { status: 500 }
    );
  }
}

