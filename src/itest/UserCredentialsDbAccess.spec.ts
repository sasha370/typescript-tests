import { UserCredentialsDbAccess } from "../app/Authorization/UserCredentialsDbAccess";
import { UserCredentials } from "../app/Models/ServerModels";

describe("UserCredentialsDBAccess itest suite", () => {
  let userCredentialsDBAccess: UserCredentialsDbAccess;
  let someUserCredentials: UserCredentials;
  const randomString = Math.random().toString(36).substring(7);

  beforeAll(() => {
    userCredentialsDBAccess = new UserCredentialsDbAccess();
    someUserCredentials = {
      username: "someUserName" + randomString,
      password: "somePassword",
      accessRights: [1, 2, 3],
    };
  });

  test("Store and retrieve UserCredentials", async () => {
    await userCredentialsDBAccess.putUserCredential(someUserCredentials);
    const resultUserCredentials =
      await userCredentialsDBAccess.getUserCredential(
        someUserCredentials.username,
        someUserCredentials.password
      );

    expect(resultUserCredentials).toMatchObject(someUserCredentials);
  });
});
