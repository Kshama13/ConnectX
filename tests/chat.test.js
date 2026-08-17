const { server } = require("../server");
const { io: Client } = require("socket.io-client");

describe("Chat rooms", () => {

    let port;
    let alice;
    let bob;
    let charlie;

    beforeAll((done) => {

        server.listen(0, () => {
            port = server.address().port;
            done();
        });

    });

    afterAll((done) => {

        if (alice) {
            alice.disconnect();
        }

        if (bob) {
            bob.disconnect();
        }

        if (charlie) {
            charlie.disconnect();
        }

        server.close(done);

    });

    test("message should only reach clients in the same room", (done) => {

        alice = Client(`http://localhost:${port}`);
        bob = Client(`http://localhost:${port}`);
        charlie = Client(`http://localhost:${port}`);

        let connectedClients = 0;

        let bobReceivedMessage = false;
        let charlieReceivedMessage = false;

        // -----------------------------
        // Bob receives a message
        // -----------------------------

        bob.on("newMessage", (data) => {

            if (data.username === "Alice") {

                bobReceivedMessage = true;

                expect(data.message).toBe("Hello everyone!");

            }

        });


        // -----------------------------
        // Charlie receives a message
        // -----------------------------

        charlie.on("newMessage", (data) => {

            if (data.username === "Alice") {

                charlieReceivedMessage = true;

            }

        });


        // -----------------------------
        // Check connections
        // -----------------------------

        const clientConnected = () => {

            connectedClients++;

            if (connectedClients < 3) {
                return;
            }

            // All three clients are connected.
            // Now join their rooms.

            alice.emit(
                "joinRoom",
                {
                    username: "Alice",
                    room: "general"
                },
                (aliceResponse) => {

                    expect(aliceResponse.success).toBe(true);


                    bob.emit(
                        "joinRoom",
                        {
                            username: "Bob",
                            room: "general"
                        },
                        (bobResponse) => {

                            expect(bobResponse.success).toBe(true);


                            charlie.emit(
                                "joinRoom",
                                {
                                    username: "Charlie",
                                    room: "gaming"
                                },
                                (charlieResponse) => {

                                    expect(charlieResponse.success).toBe(true);


                                    // Alice sends message
                                    alice.emit(
                                        "sendMessage",
                                        "Hello everyone!"
                                    );


                                    // Give Socket.io time to deliver
                                    // the message to the clients.

                                    setTimeout(() => {

                                        expect(bobReceivedMessage)
                                            .toBe(true);

                                        expect(charlieReceivedMessage)
                                            .toBe(false);

                                        done();

                                    }, 100);

                                }
                            );
                        }
                    );
                }
            );
        };


        alice.on("connect", clientConnected);
        bob.on("connect", clientConnected);
        charlie.on("connect", clientConnected);

    });

});