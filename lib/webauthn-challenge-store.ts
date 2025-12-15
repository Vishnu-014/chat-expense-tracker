const registrationChallenges = new Map<string, string>();
const authenticationChallenges = new Map<string, string>();

export function setRegistrationChallenge(userId: string, challenge: string) {
  registrationChallenges.set(userId, challenge);
}

export function consumeRegistrationChallenge(
  userId: string
): string | undefined {
  const challenge = registrationChallenges.get(userId);
  if (challenge) registrationChallenges.delete(userId);
  return challenge;
}

export function setAuthenticationChallenge(userId: string, challenge: string) {
  authenticationChallenges.set(userId, challenge);
}

export function consumeAuthenticationChallenge(
  userId: string
): string | undefined {
  const challenge = authenticationChallenges.get(userId);
  if (challenge) authenticationChallenges.delete(userId);
  return challenge;
}

