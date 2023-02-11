import { SessionToken } from "./../../app/Models/ServerModels";
import { SessionTokenDBAccess } from "../../app/Authorization/SessionTokenDBAccess";
import * as Nedb from "nedb";

jest.mock("nedb");
describe("SessionTokenDBAccess test suite", () => {
  let sessionTokenDBAccess: SessionTokenDBAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const someToken: SessionToken = {
    accessRights: [],
    expirationTime: new Date(),
    tokenId: "someTokenId",
    userName: "someUserName",
    valid: true,
  };

  beforeEach(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("storeSessionToken without error", async () => {
    nedbMock.insert.mockImplementationOnce((someToken: any, callback: any) => {
      callback();
    });

    await sessionTokenDBAccess.storeSessionToken(someToken);
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function));
  });

  test("storeSessionToken with error", async () => {
    nedbMock.insert.mockImplementationOnce((someToken: any, callback: any) => {
      callback(new Error("some error"));
    });

    await expect(
      sessionTokenDBAccess.storeSessionToken(someToken)
    ).rejects.toThrow("some error");
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function));
  });

  test("getToken without error", async () => {
    const someTokenId = "someTokenId";
    nedbMock.find.mockImplementationOnce(
      ({ tokenId: someTokenId }, callback: any) => {
        callback(null, ["docs"]);
      }
    );

    await sessionTokenDBAccess.getToken(someTokenId);
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    );
  });

  test("getToken return nothing", async () => {
    const someTokenId = "someTokenId";
    nedbMock.find.mockImplementationOnce(
      ({ tokenId: someTokenId }, callback: any) => {
        callback(null, []);
      }
    );

    await sessionTokenDBAccess.getToken(someTokenId);
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    );
  });

  test("getToken with error", async () => {
    const someTokenId = "someTokenId";
    nedbMock.find.mockImplementationOnce(
      ({ tokenId: someTokenId }, callback: any) => {
        callback(new Error("some error"));
      }
    );

    await expect(sessionTokenDBAccess.getToken(someTokenId)).rejects.toThrow(
      "some error"
    );
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    );
  });

  test("deleteToken without error", async () => {
    const someTokenId = "someTokenId";
    nedbMock.remove.mockImplementationOnce(
      ({ tokenId: someTokenId }, {}, callback: any) => {
        callback(null, 1);
      }
    );

    await sessionTokenDBAccess.deleteToken(someTokenId);
    expect(nedbMock.remove).toBeCalledWith(
      { tokenId: someTokenId },
      {},
      expect.any(Function)
    );
  });

  test("deleteToken with Error", async () => {
    const someTokenId = "someTokenId";
    nedbMock.remove.mockImplementationOnce(
      ({ tokenId: someTokenId }, {}, callback: any) => {
        callback(new Error("Token not found"));
      }
    );

    await expect(sessionTokenDBAccess.deleteToken(someTokenId)).rejects.toThrow(
      "Token not found"
    );
    expect(nedbMock.remove).toBeCalledWith(
      { tokenId: someTokenId },
      {},
      expect.any(Function)
    );
  });
});
