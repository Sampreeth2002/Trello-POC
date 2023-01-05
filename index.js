var express = require("express");
var http = require("http");
var OAuth = require("oauth").OAuth;
var url = require("url");

var app = express();

app.use(express.static("public"));

const requestURL = "https://trello.com/1/OAuthGetRequestToken";
const accessURL = "https://trello.com/1/OAuthGetAccessToken";
const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken";
const appName = "Trello OAuth Example";
const scope = "read";
const expiration = "never";

const key = "1f4d0c738df549435ed8f705138a6de3";
const secret =
  "aa6ad78fa21c31e92330772003584ed93e333e37b2f80d511db238a8db48438d";

const loginCallback = "http://localhost:3000/callback";

const oauth_secrets = {};

const oauth = new OAuth(
  requestURL,
  accessURL,
  key,
  secret,
  "1.0A",
  loginCallback,
  "HMAC-SHA1"
);

const login = function (request, response) {
  oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
    oauth_secrets[token] = tokenSecret;
    response.redirect(
      `${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}&expiration=${expiration}`
    );
  });
};

let token, tokenSecret;

var callback = function (req, res) {
  const query = url.parse(req.url, true).query;
  const token = query.oauth_token;

  const tokenSecret = oauth_secrets[token];
  const verifier = query.oauth_verifier;
  oauth.getOAuthAccessToken(
    token,
    tokenSecret,
    verifier,
    function (error, accessToken, accessTokenSecret, results) {
      console.log(accessToken);
      oauth.getProtectedResource(
        "https://api.trello.com/1/members/me",
        "GET",
        accessToken,
        accessTokenSecret,
        function (error, data, response) {
          res.send(data);
        }
      );
    }
  );
};

app.get("/", function (request, response) {
  response.send(
    "<h1>Oh, hello there!</h1><a href='./login'>Login with OAuth!</a>"
  );
});

app.get("/login", function (request, response) {
  login(request, response);
});

app.get("/callback", function (request, response) {
  callback(request, response);
});

app.get("/me", function (req, res) {
  res.send(
    "<a href='https://api.trello.com/1/members/me/?key=1f4d0c738df549435ed8f705138a6de3&token=ATTAc030f01bfad029f51131d8aeb3e05b56cbb4e6f67f68b62424a9a44c44657411B5A774DE'>My Details</a>"
  );
});

var server = app.listen(3000, function () {
  console.log("Server up and running");
  console.log("Listening on port %s", server.address().port);
});
