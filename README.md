ConnectX

A real-time chat application built with Node.js, Express.js, and Socket.io that allows multiple users to communicate instantly through separate chat rooms.

Problem

Traditional HTTP/REST communication follows a request-response model, which isn't ideal for a chat application where messages need to appear immediately for other users.

ConnectX uses Socket.io to establish real-time, bidirectional communication between clients and the server.

Architecture
Browser
   │
   │ HTTP request
   ▼
Node.js + Express
   │
   │ Socket.io connection
   ▼
Socket.io Server
   │
   ├── Room: general
   │      ├── Alice
   │      └── Bob
   │
   └── Room: gaming
          └── Charlie
Message flow
Alice's Browser
      │
      │ sendMessage
      ▼
Socket.io Server
      │
      │ identifies Alice's room
      ▼
general room
      │
      ├── Alice
      └── Bob

Only clients in the same room receive the message.

Tech Stack
Node.js — backend JavaScript runtime
Express.js — HTTP server/application framework
Socket.io — real-time, bidirectional communication
Jest — automated testing
Socket.io Client — simulating clients during integration tests
Supertest — testing HTTP endpoints
Features
Multiple simultaneous client connections
Multiple chat rooms
Real-time bidirectional messaging
Room-based message broadcasting
Username and room validation
Message validation and length limits
Connection/disconnection handling
Automatic Socket.io reconnection
Automatic room rejoining after reconnection
Automated HTTP and Socket.io tests
Why Socket.io instead of REST APIs?

REST APIs follow a request-response model:

Client → Request → Server
Client ← Response ← Server

For chat, the server needs to push a new message to other connected clients immediately.

Socket.io provides persistent, bidirectional communication:

Client ↔ Server

This allows the server to emit an event to connected clients whenever a new message arrives instead of requiring clients to repeatedly poll the server.

Why no database?

The current version intentionally does not persist chat history.

Messages exist only during the active server/client session. Since persistent chat history isn't a requirement for this version, a database isn't necessary.

This also keeps the project focused on learning real-time communication, sockets, rooms, and connection management.

Testing

ConnectX includes automated tests using Jest.

The tests verify:

The /health HTTP endpoint returns the expected response.
Multiple Socket.io clients can connect.
Clients can join different rooms.
A message sent to one room reaches clients in that room.
A message does not reach clients in another room.
Limitations / Future Improvements

A production-ready version could add:

Authentication — verify user identity instead of accepting any username.
Persistent chat history — store messages in a database.
Message timestamps — show when messages were sent.
Private messaging — allow users to communicate privately.
Horizontal scaling — use something such as Redis so Socket.io can work across multiple server instances.
Stronger security — add authentication, authorization, input sanitization, and abuse protection.

Running the project:

npm install
node server.js

Then open:

http://localhost:3000

To run tests:

npm test