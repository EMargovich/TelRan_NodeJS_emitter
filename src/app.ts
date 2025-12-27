
import {createServer, type IncomingMessage} from "node:http";
import {addUser, deleteUser, getAllUsers, getUserById, updateUser, type User} from "./model/users.js";
import {emitter} from "./events/emitter.js";

let port = 3005;

/*
GET/ -> Hello
GET/api/users -> list of users
POST/api/users -> add user
DELETE/api/users -> delete user by id
PUT/api/users -> update user by id
GET/api/users?userId=<>get user by id
*/

async function parseBody(req: IncomingMessage) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            if (!body) {
                return resolve({});
            }
            try {
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch (e) {
                reject(new Error("Invalid JSON response"));
            }
        })
        req.on("error", (err) => {
            reject(err);
        })
    });
}

const myServer = createServer(async (req, res) => {
    const{url, method} = req;
    console.log("Request: ", JSON.stringify(url), method);

    const parsedUrl = new URL(url??"/", "http://localhost:" + port);
    const pathname = parsedUrl.pathname;
    const usersIdParam = parsedUrl.searchParams.get("userId");

    try {
        if (pathname === "/" && method === "GET") {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end("Hello Carmiel!");
            return;
        }
        if (pathname === "/api/users" && method === "GET") {
            if (!usersIdParam) {
                const users = getAllUsers();
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(users));
            } else {
                const user = getUserById(Number(usersIdParam));
                if (user) {
                    res.writeHead(200, {"Content-Type": "application/json"});
                    res.end(JSON.stringify(user));
                } else {
                    res.writeHead(409, {"Content-Type": "text/html"});
                    res.end("User not exists!");
                }
            }
            return;
        }
        if (pathname === "/api/users" && method === "POST") {
            const body = (await parseBody(req)) as User;
            const isSuccess = addUser(body);
            if (isSuccess) {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end("User added successfully.");
                emitter.emit("userCreated");
            } else {
                res.writeHead(409, {"Content-Type": "text/html"});
                res.end("User already exists!");
            }
            return;
        }
        if (pathname === "/api/users" && method === "DELETE") {
            const body = (await parseBody(req)) as User;
            const deletedUser = deleteUser(body);
            if (!deletedUser) {
                res.writeHead(400, {"Content-Type": "text/html"});
                res.end("User does not exist!");
            } else {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(`User ID ${deletedUser.id} delete successfully.`);
                emitter.emit("userDeleted", deletedUser);
            }
            return;
        }
        if (pathname === "/api/users" && method === "PUT") {
            const body = (await parseBody(req)) as User;
            const updatedUser = updateUser(body);
            if (!updatedUser) {
                res.writeHead(400, {"Content-Type": "text/html"});
                res.end("User does not exist!");
            } else {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(`User ID ${updatedUser.id} update successfully!`);
                emitter.emit("userUpdated");
            }
            return;
        }
    } catch (e) {
        console.error("Server error", e);
        res.writeHead(500, {"Content-Type": "text/html"});
        res.end('Internal Server Error');
    }
});

function startServer(port: number) {
    console.log(`Trying to start server on port started: ${port}`);
    myServer.listen(port);
}

myServer.on('listening', () => {
    console.log(`Server started on http://localhost:${port}`);
});

myServer.on('error', (e:any) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`Port ${port} is in use. Retrying on ${port + 1}...`);
        port++;
        setTimeout(() => {
            startServer(port);
        }, 500);
    } else {
        console.error('Server error:', e);
    }
})

startServer(port);