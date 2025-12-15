import { NextResponse } from 'next/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import {
  consumeAuthenticationChallenge,
} from '@/lib/webauthn-challenge-store';
import { RP_ID, RP_ORIGIN } from '@/lib/webauthn-config';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, authenticationResponse } = await request.json();

    if (!email || !authenticationResponse) {
      return NextResponse.json(
        { error: 'Email and authentication response are required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const normalizedEmail = email.toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user || !Array.isArray(user.passkeys) || user.passkeys.length === 0) {
      return NextResponse.json(
        { error: 'No passkeys registered for this user' },
        { status: 404 }
      );
    }

    const passkey = user.passkeys.find(
      (pk: any) => pk.credentialID === authenticationResponse.id
    );

    if (!passkey) {
      return NextResponse.json(
        { error: 'Passkey not recognized for this user' },
        { status: 400 }
      );
    }

    const expectedChallenge = consumeAuthenticationChallenge(user._id.toString());
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'No authentication challenge found or it expired' },
        { status: 400 }
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credentialID,
        publicKey: isoBase64URL.toBuffer(passkey.credentialPublicKey),
        counter: passkey.counter,
        transports: passkey.transports,
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Passkey authentication verification failed' },
        { status: 400 }
      );
    }

    const { authenticationInfo } = verification;
    if (authenticationInfo?.newCounter !== undefined) {
      await usersCollection.updateOne(
        {
          _id: new ObjectId(user._id),
          'passkeys.credentialID': passkey.credentialID,
        },
        {
          $set: {
            'passkeys.$.counter': authenticationInfo.newCounter,
            updatedAt: new Date().toISOString(),
          },
        }
      );
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Passkey login finish error:', error);
    return NextResponse.json(
      { error: 'Failed to complete passkey login', details: error.message },
      { status: 500 }
    );
  }
}

