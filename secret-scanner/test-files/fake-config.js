// THIS FILE IS INTENTIONALLY FULL OF FAKE SECRETS FOR TESTING
// DO NOT USE ANY OF THESE VALUES — THEY ARE ALL FAKE

const config = {
  // aws stuff (fake)
  aws_access_key: "AKIAIOSFODNN7EXAMPLE",
  aws_secret_access_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",

  // database (fake)
  db_url: "mongodb://admin:supersecretpass123@db.example.com:27017/production",
  postgres_url: "postgres://user:p4ssw0rd@10.0.0.5:5432/maindb",

  // api keys (fake - changed to avoid github push protection)
  api_key: "my_fake_api_key_abcdef1234567890abcd",
  stripe_key: "FAKE_stripe_test_key_placeholder_value",
  google_api: "AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe",

  // auth tokens (fake)
  github_token: "ghp_FAKE_TOKEN_PLACEHOLDER_1234567890abcde",

  // passwords (fake)
  password: "MySuper$ecretP@ss2024!",
  smtp_password: "emailpassword123",

  // slack (fake - modified for github push protection)
  slack_webhook: "https://hooks.example.com/services/TXXXXXXXX/BXXXXXXXX/fake_webhook_placeholder",
};

// private key example (fake)
const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/yGaXxw
-----END RSA PRIVATE KEY-----`;

// hardcoded server
const server = "192.168.1.100:8080";

module.exports = config;
