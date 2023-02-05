import { Utils } from "../../app/Utils/Utils";
import { HTTP_CODES, SessionToken } from "./../../app/Models/ServerModels";
import { HTTP_METHODS } from "./../../app/Models/ServerModels";
import { LoginHandler } from "./../../app/Handlers/LoginHandler";

describe("LoginHandler test suite", () => {
  let loginHandler: LoginHandler;

  const requestMock = {
    method: "",
  };
  const responseMock = {
    writeHead: jest.fn(),
    write: jest.fn(),
    statusCode: 0,
  };
  const authorizerMock = {
    generateToken: jest.fn(),
  };

  const getRequestBodyMock = jest.fn();

  beforeEach(() => {
    loginHandler = new LoginHandler(
      requestMock as any,
      responseMock as any,
      authorizerMock as any
    );
    requestMock.method = HTTP_METHODS.POST;
    Utils.getRequestBody = getRequestBodyMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const someSessionToken: SessionToken = {
    tokenId: "someTokenId",
    userName: "someUserName",
    expirationTime: new Date(),
    valid: true,
    accessRights: [1, 2, 3],
  };

  test("options request", async () => {
    requestMock.method = "OPTIONS";
    await loginHandler.handleRequest();
    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
  });

  test("not handled http method", async () => {
    requestMock.method = "notSupportedMethod";
    await loginHandler.handleRequest();
    expect(responseMock.writeHead).not.toBeCalled();
  });

  test("post request", async () => {
    getRequestBodyMock.mockReturnValueOnce({
      username: "test",
      password: "test",
    });
    authorizerMock.generateToken.mockReturnValueOnce(someSessionToken);
    await loginHandler.handleRequest();
    expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.CREATED, {
      "Content-Type": "application/json",
    });
    expect(responseMock.write).toBeCalledWith(JSON.stringify(someSessionToken));
  });

  test("post request with wrong credentials", async () => {
    getRequestBodyMock.mockReturnValueOnce({
      username: "notUser",
      password: "notPassword",
    });
    authorizerMock.generateToken.mockReturnValueOnce(null);
    await loginHandler.handleRequest();
    expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
    expect(responseMock.write).toBeCalledWith("wrong username or password");
  });

  test("post request with error", async () => {
    getRequestBodyMock.mockImplementationOnce(() => {
      throw new Error("someError");
    });
    await loginHandler.handleRequest();
    expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
    expect(responseMock.write).toBeCalledWith("Internal error: someError");
  });
});
