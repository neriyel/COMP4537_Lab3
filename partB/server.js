
// TODO: understand url parser in detail

import { labels } from './lang/en/text.js';
import http from 'http';
import https from 'https';
import fs from 'fs';
import url from 'url';

//  ============ SSL Certificate Options =========================================
const options = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem')
}

// ============ Create a route map (move logic onto here) ============================================
const routes = {
    // Home page
    '/': (req, res, qdata) => {
        let userName = qdata.name;
        if (userName) {
            let date = new Date();
            res.end(labels.prompt(userName, date))
        } else {
            res.end(`Please input a name (directly in the url /?name=<YOUR_NAME>)`)
        }
    },

    // Write file page
    '/writefile/': (req, res, qdata) => {
        let filename = qdata.filename;
        let content = qdata.content;

        if (filename && content) {
            fs.appendFile(filename, content, 'utf8', (err) => {
                if (err) {
                    console.err(err);
                    res.end(`Error writing to file: ${filename}`)
                } else {
                    res.end(`File ${filename} has been successfully written to! (Content JUST added: ${content})`)
                }
            })
        } else {
            res.end(`Error: please provide both filename and content.`)
        }
    },

    // Read file page
    '/readfile/': (req, res, qdata) => {
        let filename = qdata.filename;

        if (filename) {
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    res.end(`Error cannot find file name with ${filename}`)
                } else {
                    res.end(data)
                }
            })
        } else {
            res.send(`Please provide a filename.`)
        }
    }
}

// ================= HTTPS Server =================================================
http.createServer((req, res) => {
    console.log('HTTPS Request received');
    res.writeHead(200, { 'Content-type': "text/html", "Access-Control-Allow-Origin": "*" });

    // Parsing url for route and query params 
    let adr = req.url;                  //returns '/?name=chez'          
    let q = url.parse(adr, true);
    let qdata = q.query;                //returns an object: { year: 2017, month: 'July' }
    let route = q.pathname;             //determines which route to go on (after domain name, before query param)

    // Debugging
    console.log('host', q.host);            //returns 'localhost:8080'
    console.log('pathname', q.pathname);    //returns '/name'
    console.log('search', q.search);        //returns 'name?="neriyel"'
    console.log('data object', qdata);      //returns an object: { name: 'neriyel' }

    // Send through correct route
    let routeHandler = routes[route];   // returns a function
    if (routeHandler) {
        routeHandler(req, res, qdata);
    } else {
        res.end(`Error: invalid endpoint!`)
    }

}).listen(443, '0.0.0.0', () => {
    console.log('Server listening on port 443')
});

// ================= HTTP → HTTPS Redirect ========================================
// http.createServer((req, res) => {
//     const host = req.headers['host'];
//     res.writeHead(301, { "Location": `https://${host}${req.url}` }); // 301: moved permanently
//     res.end();
// }).listen(80, '0.0.0.0', () => {
//     console.log('HTTP server running on port 80 (redirecting to HTTPS)');
// });

