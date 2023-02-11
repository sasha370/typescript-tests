import { UserCredentialsDbAccess } from "../../app/Authorization/UserCredentialsDbAccess";
import { UserCredentials } from "../../app/Models/ServerModels";
import * as Nedb from "nedb";

jest.mock("nedb");

describe("UserCredentialsDBAccess itest suite", () => {
  let userCredentialsDBAccess: UserCredentialsDbAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
  };

  const someUserCredentials: UserCredentials = {
    username: "someUsername",
    password: "somePassword",
    accessRights: [1, 2, 3],
  };

  beforeAll(() => {
    userCredentialsDBAccess = new UserCredentialsDbAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("putUserCredential without error", async () => {
    nedbMock.insert.mockImplementationOnce(
      (someUserCredentials: any, callback: any) => {
        callback();
      }
    );

    await userCredentialsDBAccess.putUserCredential(someUserCredentials);
    expect(nedbMock.insert).toBeCalledWith(
      someUserCredentials,
      expect.any(Function)
    );
  });

  test("putUserCredential with error", async () => {
    nedbMock.insert.mockImplementationOnce(
      (someUserCredentials: any, callback: any) => {
        callback(new Error("some error"));
      }
    );

    await expect(
      userCredentialsDBAccess.putUserCredential(someUserCredentials)
    ).rejects.toThrow("some error");
    expect(nedbMock.insert).toBeCalledWith(
      someUserCredentials,
      expect.any(Function)
    );
  });

  test("getUserCredential without error", async () => {
    nedbMock.find.mockImplementationOnce(
      (someUserCredentials: any, callback: any) => {
        callback(null, ["docs"]);
      }
    );

    await userCredentialsDBAccess.getUserCredential(
      someUserCredentials.username,
      someUserCredentials.password
    );

    expect(nedbMock.find).toBeCalledWith(
      {
        username: someUserCredentials.username,
        password: someUserCredentials.password,
      },
      expect.any(Function)
    );
  });

  test("getUserCredential with error", async () => {
    nedbMock.find.mockImplementationOnce(
      (someUserCredentials: any, callback: any) => {
        callback(new Error("some error"));
      }
    );

    await expect(
      userCredentialsDBAccess.getUserCredential(
        someUserCredentials.username,
        someUserCredentials.password
      )
    ).rejects.toThrow("some error");
    expect(nedbMock.find).toBeCalledWith(
      {
        username: someUserCredentials.username,
        password: someUserCredentials.password,
      },
      expect.any(Function)
    );
  });

  test("getUserCredential with no result", async () => {
    nedbMock.find.mockImplementationOnce(
      (someUserCredentials: any, callback: any) => {
        callback(null, []);
      }
    );

    await expect(
      userCredentialsDBAccess.getUserCredential(
        someUserCredentials.username,
        someUserCredentials.password
      )
    );
    expect(nedbMock.find).toBeCalledWith(
      {
        username: someUserCredentials.username,
        password: someUserCredentials.password,
      },
      expect.any(Function)
    );
  });
});
