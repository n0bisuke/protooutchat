require('dotenv').config();

const { SkyWayAuthToken } = require(`@skyway-sdk/token`);
const { v4: uuidv4 } = require('uuid');

const testToken = new SkyWayAuthToken({
    jti: uuidv4(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 600,
    scope: {
      app: {
        id: process.env.SK_ID,
        turn: true,
        actions: ["read"],
        channels: [
          {
            id: "*",
            name: "*",
            actions: ["write"],
            members: [
              {
                id: "*",
                name: "*",
                actions: ["write"],
                publication: {
                  actions: ["write"],
                },
                subscription: {
                  actions: ["write"],
                },
              },
            ],
            sfuBots: [
              {
                actions: ["write"],
                forwardings: [
                  {
                    actions: ["write"]
                  }
                ]
              }
            ]
          },
        ],
      },
    },
});

module.exports = () => {
    const tokenString = testToken.encode(process.env.SK_SECRET);
    // console.log(tokenString);
    return tokenString;
}