/**
 * Created by sequoya on 24/04/2017.
 */

'use strict';

const Redis = require('ioredis'),
    express = require('express'),
    app = express(),
    http = require('http'),
    _ = require('lodash');

const redis = Redis({
    dropBufferSupport: true
});

const server = http.createServer(app);

console.magie = data => {
    console.log(data);
};

server.listen(process.env.PORT || 5000);

let magie = (u) => redis
    .multi(
        ['smembers', `user:${u}:following`],
        ['smembers', `user:${u}:followers`],
        ['smembers', `user:${u}:subscribers`]
    )
    .exec()
    .then(results => {
            return {
                id: u,
                following: results[0],
                followers: results[1],
                subscribers: results[2]
            }
    });

const graph = redis
    .sort('users')
    .then(users => Promise.all(users.map(magie)));


app.get('/api/graph', (req, res, next) => {
    graph
        .then(results => res.send(results))
        .catch(error => res.status(500).send(error));
});

// graph
//     .then(console.log)
//     .catch(console.error);