import { LoginHandler } from "./../../app/Handlers/LoginHandler";
import { Server } from "../../app/Server/Server";
import { Authorizer } from "../../app/Authorization/Authorizer";
import { DataHandler } from "../../app/Handlers/DataHandler";
import { UsersDBAccess } from "../../app/Data/UsersDBAccess";

jest.mock("../../app/Handlers/LoginHandler");
jest.mock("../../app/Handlers/DataHandler");
jest.mock("../../app/Authorization/Authorizer");

const requestMock = {
  url: "",
};
const responseMock = {
  end: jest.fn(),
};
const listenMock = {
  listen: jest.fn(),
};

jest.mock("http", () => ({
  createServer: (cb: any) => {
    cb(requestMock, responseMock);
    return listenMock;
  },
}));

describe("Server test suite", () => {
  test("should create server on port 8080", () => {
    const server = new Server();
    server.startServer();
    expect(listenMock.listen).toHaveBeenCalledWith(8080);
    expect(responseMock.end).toBeCalled();
  });

  test("sgould handle login request", () => {
    requestMock.url = "http://localhost:8080/login";
    const server = new Server();
    server.startServer();
    const handleRequestSpy = jest.spyOn(
      LoginHandler.prototype,
      "handleRequest"
    );
    expect(handleRequestSpy).toBeCalled();
    expect(LoginHandler).toBeCalledWith(
      requestMock,
      responseMock,
      expect.any(Authorizer)
    );
  });

  test("should handle data request", () => {
    requestMock.url = "http://localhost:8080/users";
    const server = new Server();
    server.startServer();
    const handleRequestSpy = jest.spyOn(DataHandler.prototype, "handleRequest");
    expect(handleRequestSpy).toBeCalled();
    expect(DataHandler).toBeCalledWith(
      requestMock,
      responseMock,
      expect.any(Authorizer),
      expect.any(UsersDBAccess)
    );
  });
});
