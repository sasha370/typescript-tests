import { Utils } from "../../app/Utils/Utils";
import {
  AccessRight,
  HTTP_CODES,
  TokenState,
  TokenValidator,
} from "./../../app/Models/ServerModels";
import { DataHandler } from "../../app/Handlers/DataHandler";

describe("DataHandler test suite", () => {
  let dataHandler: DataHandler;

  const tokenMock = "someToken";
  const tokenRight = {
    accessRights: [AccessRight.READ],
    state: TokenState.VALID,
  };

  const parseUrlMock = jest.fn();

  const requestMock = {
    method: "",
    headers: {
      authorization: "",
    },
    url: "http://localhost:8080/data",
  };
  const responseMock = {
    writeHead: jest.fn(),
    write: jest.fn(),
    statusCode: 0,
  };
  const TokenValidatorMock = {
    validateToken: jest.fn(),
  };
  const UsersDBAccessMock = {
    getUsersByName: jest.fn(),
  };

  beforeEach(() => {
    dataHandler = new DataHandler(
      requestMock as any,
      responseMock as any,
      TokenValidatorMock as any,
      UsersDBAccessMock as any
    );
    requestMock.method = "GET";
    requestMock.headers.authorization = tokenMock;
    Utils.parseUrl = parseUrlMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("options request", async () => {
    requestMock.method = "OPTIONS";
    await dataHandler.handleRequest();
    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
  });

  test("not handled http method", async () => {
    requestMock.method = "notSupportedMethod";
    await dataHandler.handleRequest();
    expect(responseMock.writeHead).not.toBeCalled();
  });

  test("GET request", async () => {
    TokenValidatorMock.validateToken.mockReturnValueOnce(tokenRight);
    UsersDBAccessMock.getUsersByName.mockReturnValueOnce([
      { name: "testUser" },
    ]);
    parseUrlMock.mockReturnValueOnce({ query: { name: "testUser" } });
    await dataHandler.handleRequest();
    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK, {
      "Content-Type": "application/json",
    });
    expect(responseMock.write).toBeCalledWith(
      JSON.stringify([{ name: "testUser" }])
    );
  });

  test("GET request without requred params", async () => {
    TokenValidatorMock.validateToken.mockReturnValueOnce(tokenRight);
    parseUrlMock.mockReturnValueOnce({ query: {} });
    await dataHandler.handleRequest();
    expect(responseMock.write).toBeCalledWith(
      "Missing name parameter in the request!"
    );
    expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
  });

  test("GET request with invalid token", async () => {
    TokenValidatorMock.validateToken.mockReturnValueOnce({
      accessRights: [],
      state: TokenState.INVALID,
    });
    await dataHandler.handleRequest();
    expect(responseMock.write).toBeCalledWith("Unauthorized operation!");
    expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
  });

  test("GET request with Error", async () => {
    TokenValidatorMock.validateToken.mockImplementationOnce(() => {
      throw new Error("Some error");
    });
    await dataHandler.handleRequest();
    expect(responseMock.write).toBeCalledWith("Internal error: Some error");
    expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
  });
});
