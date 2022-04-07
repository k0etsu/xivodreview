// import { ApolloClient, gql, InMemoryCache, ApolloProvider } from '@apollo/client';

require('dotenv').config()
// console.log(process.env.FFLOGS_CLIENT_SECRET)

const express = require("express");
const axios = require("axios");
var cors = require("cors");

const FFLOGS_CLIENT_ID = process.env.FFLOGS_CLIENT_ID;
const FFLOGS_CLIENT_SECRET = process.env.FFLOGS_CLIENT_SECRET;
const FFLOGS_URL = "https://www.fflogs.com/oauth/token";

const https = require('https');

var options = {
  hostname: "www.fflogs.com",
  method: "POST",
  path: "/oauth/token",
  port: 443,
  auth: FFLOGS_CLIENT_ID + ":" + FFLOGS_CLIENT_SECRET,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  }
}

console.log(FFLOGS_CLIENT_ID + ":" + FFLOGS_CLIENT_SECRET)

const data = "grant_type=client_credentials"

var req = https.request(options, function(res){
  console.log('STATUS: ' + res.statusCode);

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.write(data);
req.end();

const hostname = '127.0.0.1';
const port = 3000;

const server = https.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('I did it!');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
