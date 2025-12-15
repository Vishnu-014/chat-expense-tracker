import { NextResponse } from 'next/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/lib/db-utils';
import {
  consumeRegistrationChallenge,
} from '@/lib/webauthn-challenge-store';
import { RP_ID, RP_ORIGIN } from '@/lib/webauthn-config';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, attestationResponse } = await request.json();

    if (!email || !attestationResponse) {
      return NextResponse.json(
        { error: 'Email and attestation response are required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const normalizedEmail = email.toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found for passkey registration' },
        { status: 404 }
      );
    }

    const expectedChallenge = consumeRegistrationChallenge(user._id.toString());
    if (!expectedChallenge) {
      return NextResponse.json(
        { error: 'No registration challenge found or it expired' },
        { status: 400 }
      );
    }

    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Passkey registration verification failed' },
        { status: 400 }
      );
    }

    const {
      credential,
      credentialDeviceType,
      credentialBackedUp,
      attestationObject,
    } = verification.registrationInfo;

    const credentialIDString = credential.id;
    const publicKeyString = isoBase64URL.fromBuffer(credential.publicKey);
    const passkeys = Array.isArray(user.passkeys) ? user.passkeys : [];

    const alreadyExists = passkeys.some(
      (pk: any) => pk.credentialID === credentialIDString
    );

    if (!alreadyExists) {
      await usersCollection.updateOne(
        { _id: new ObjectId(user._id) },
        {
          $push: {
            passkeys: {
              credentialID: credentialIDString,
              credentialPublicKey: publicKeyString,
              counter: credential.counter,
              transports: credential.transports ?? attestationResponse.response.transports,
              deviceType: credentialDeviceType,
              backedUp: credentialBackedUp,
              attestationObject:
                attestationObject &&
                isoBase64URL.fromBuffer(attestationObject),
              createdAt: new Date().toISOString(),
            },
          },
          $set: {
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
    console.error('Passkey register finish error:', error);
    return NextResponse.json(
      { error: 'Failed to complete passkey registration', details: error.message },
      { status: 500 }
    );
  }
}

