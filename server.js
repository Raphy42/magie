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

let magie = (u) => {
    return redis
        .pipeline()
        .smembers(`user:${u}:following`)
        .smembers(`user:${u}:followers`)
        .smembers(`user:${u}:subscribers`)
        .hmget(`user:${u}`, 'avatar', 'full_name', 'username')
        .exec()
        .then(results => {
            let data = results[3][1];
            return {
                id: u,
                following: results[0][1],
                followers: results[1][1],
                subscribers: results[2][1],
                data: _.zipObject(['avatar', 'full_name', 'username'], data)
            }
        });
};

app.use(express.static(__dirname));

app.get('/api/graph', (req, res, next) => {
    const graph = redis
        .sort('users')
        .then(users => Promise.all(users.map(magie)))
        .then(results => {
            res.send(results)
        })
        .catch(error => res.status(500).send(error));
});

// graph
//     .then(console.log)
//     .catch(console.error);