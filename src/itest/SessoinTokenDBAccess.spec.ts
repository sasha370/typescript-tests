import { SessionTokenDBAccess } from "../app/Authorization/SessionTokenDBAccess";
import { SessionToken } from "../app/Models/ServerModels";

describe("SessionTokenDBAccess itest suite", () => {
  let sessionTokenDBAccess: SessionTokenDBAccess;
  let someToken: SessionToken;
  const randomString = Math.random().toString(36).substring(7);

  beforeAll(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess();
    someToken = {
      tokenId: "someTokenId" + randomString,
      userName: "someUserName",
      valid: true,
      expirationTime: new Date(),
      accessRights: [1, 2, 3],
    };
  });

  test("Store and retrieve SessionToken", async () => {
    await sessionTokenDBAccess.storeSessionToken(someToken);
    const resultToken = await sessionTokenDBAccess.getToken(someToken.tokenId);
    expect(resultToken).toMatchObject(someToken);
  });

  test("Delete SessionToken", async () => {
    await sessionTokenDBAccess.deleteToken(someToken.tokenId);
    const resultToken = await sessionTokenDBAccess.getToken(someToken.tokenId);
    expect(resultToken).toBeUndefined();
  });

  test("Delete non-existing SessionToken", async () => {
    await expect(
      sessionTokenDBAccess.deleteToken(someToken.tokenId)
    ).rejects.toThrowError("Token not found");
  });
});
