import { UserCredentialsDbAccess } from "./../app/Authorization/UserCredentialsDbAccess";
import {
  HTTP_CODES,
  SessionToken,
  UserCredentials,
} from "./../app/Models/ServerModels";
import * as axios from "axios";

axios.default.defaults.validateStatus = function () {
  return true;
};

const serverUrl = "http://localhost:8080";
const itestUserCredentials: UserCredentials = {
  accessRights: [1, 2, 3],
  password: "123456",
  username: "itest",
};

describe("Server itest suite", () => {
  let userCredentialsDbAccess: UserCredentialsDbAccess;
  let sessionToken: SessionToken;

  beforeAll(async () => {
    userCredentialsDbAccess = new UserCredentialsDbAccess();
  });

  test("Server should be reachable", async () => {
    const response = await axios.default.options(serverUrl);
    expect(response.status).toBe(HTTP_CODES.OK);
  });

  test.skip("put credentials", async () => {
    await userCredentialsDbAccess.putUserCredential(itestUserCredentials);
  });
  test("rejection of invalid credentials", async () => {
    const response = await axios.default.post(`${serverUrl}/login`, {
      username: itestUserCredentials.username,
      password: "invalid",
    });
    expect(response.status).toBe(HTTP_CODES.NOT_fOUND);
  });

  test("with correct credentials", async () => {
    const response = await axios.default.post(`${serverUrl}/login`, {
      username: itestUserCredentials.username,
      password: itestUserCredentials.password,
    });
    expect(response.status).toBe(HTTP_CODES.CREATED);
    sessionToken = response.data;
  });

  test("query data", async () => {
    const response = await axios.default.get(`${serverUrl}/users?name=some`, {
      headers: {
        Authorization: sessionToken.tokenId,
      },
    });
    expect(response.status).toBe(HTTP_CODES.OK);
  });

  test("query data with invalid token", async () => {
    const response = await axios.default.get(`${serverUrl}/users?name=some`, {
      headers: {
        Authorization: sessionToken.tokenId + "invalid",
      },
    });
    expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED);
  });
});
