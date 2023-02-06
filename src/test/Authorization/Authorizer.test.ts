import {
  AccessRight,
  Account,
  SessionToken,
  TokenState,
} from "./../../app/Models/ServerModels";
import { SessionTokenDBAccess } from "./../../app/Authorization/SessionTokenDBAccess";
import { Authorizer } from "../../app/Authorization/Authorizer";
import { UserCredentialsDbAccess } from "../../app/Authorization/UserCredentialsDbAccess";

jest.mock("../../app/Authorization/SessionTokenDBAccess");
jest.mock("../../app/Authorization/UserCredentialsDbAccess");

describe("Authorizer test suite", () => {
  let authorizer: Authorizer;

  const sessionTokenDBAccessMock = {
    storeSessionToken: jest.fn(),
    getToken: jest.fn(),
  };
  const userCredentialsDbAccessMock = {
    getUserCredential: jest.fn(),
  };

  const someAccount: Account = {
    username: "test",
    password: "test",
  };

  const accessRights: AccessRight[] = [1, 2, 3];

  beforeEach(() => {
    authorizer = new Authorizer(
      sessionTokenDBAccessMock as any,
      userCredentialsDbAccessMock as any
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("constructor arguments", () => {
    new Authorizer();
    expect(SessionTokenDBAccess).toBeCalled();
    expect(UserCredentialsDbAccess).toBeCalled();
  });

  test("should return session token for valid credentials", async () => {
    jest.spyOn(global.Math, "random").mockReturnValueOnce(0.1);
    jest.spyOn(global.Date, "now").mockReturnValueOnce(123);

    userCredentialsDbAccessMock.getUserCredential.mockResolvedValueOnce({
      username: "test",
      accessRights: accessRights,
    });
    const expectedSessionToken: SessionToken = {
      userName: "test",
      accessRights: accessRights,
      valid: true,
      tokenId: "3lllllllllm",
      expirationTime: new Date(123 + 60 * 60 * 1000),
    };
    const sessionToken = await authorizer.generateToken(someAccount);
    expect(sessionToken).toEqual(expectedSessionToken);
    expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(
      sessionToken
    );
  });

  test("should return nothing if not authorized", async () => {
    userCredentialsDbAccessMock.getUserCredential.mockImplementationOnce(
      () => null
    );
    const sessionToken = await authorizer.generateToken(someAccount);
    expect(sessionToken).toEqual(null);
  });

  test("validateToken should return valid token data", async () => {
    const sessionToken: SessionToken = {
      userName: "test",
      accessRights: accessRights,
      valid: true,
      tokenId: "someTokenId",
      expirationTime: new Date(Date.now() + 1),
    };
    const expectedValidTokenData = {
      accessRights: accessRights,
      state: TokenState.VALID,
    };
    sessionTokenDBAccessMock.getToken.mockResolvedValueOnce(sessionToken);

    const validateToken = await authorizer.validateToken(sessionToken.tokenId);
    expect(validateToken).toEqual(expectedValidTokenData);
  });

  test("validateToken should return Invalid if token incorrect", async () => {
    const sessionToken: SessionToken = {
      userName: "test",
      accessRights: accessRights,
      valid: false,
      tokenId: "someTokenId",
      expirationTime: new Date(Date.now() + 1),
    };
    const expectedValidTokenData = {
      accessRights: [],
      state: TokenState.INVALID,
    };
    sessionTokenDBAccessMock.getToken.mockResolvedValueOnce(sessionToken);

    const validateToken = await authorizer.validateToken(sessionToken.tokenId);
    expect(validateToken).toEqual(expectedValidTokenData);
  });

  test("validateToken should return EXPIRED", async () => {
    const sessionToken: SessionToken = {
      userName: "test",
      accessRights: accessRights,
      valid: true,
      tokenId: "someTokenId",
      expirationTime: new Date(Date.now() - 1),
    };
    const expectedValidTokenData = {
      accessRights: [],
      state: TokenState.EXPIRED,
    };
    sessionTokenDBAccessMock.getToken.mockResolvedValueOnce(sessionToken);

    const validateToken = await authorizer.validateToken(sessionToken.tokenId);
    expect(validateToken).toEqual(expectedValidTokenData);
  });
});
