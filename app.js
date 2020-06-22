const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const secret = "paodeabatata";

app.use(cors());
app.use(bodyParser.urlencoded({ extend: false }));
app.use(bodyParser.json());


function auth(req, res, next) {
    const authToken = req.headers['authorization'];
    if (authToken != undefined) {
        console.log(authToken);
        const token = authToken.split(' ');
        jwt.verify(token[1], secret, (err, data) => {
            if (err) {
                res.status(401).json({ err: "TOKEN INVALID" });
            } else {
                req.token = token[1];
                req.loggUser = { id: data.id, email: data.email };
                console.log(data);
                next();
            }
        });
        console.log(token);

    } else {
        res.status(401).json({ err: "TOKEN INVALID" });
    }

}



var DB = {
    games: [
        { id: 1, title: "call of duty", year: 2020, price: 40 },
        { id: 2, title: "call of duty 1", year: 2010, price: 30 },
        { id: 3, title: "call of duty 2", year: 2015, price: 150 },
        { id: 4, title: "call of duty 3", year: 2011, price: 430 },
        { id: 5, title: "call of duty 4", year: 2012, price: 750 },
        { id: 6, title: "call of duty 5", year: 2013, price: 450 },
        { id: 7, title: "call of duty 6", year: 2014, price: 50 },
    ],
    users: [{
            id: 1,
            name: "Paulo Oliveira",
            email: "p@p.com",
            senha: "123"
        },
        {
            id: 2,
            name: "Bruna Oliveira",
            email: "b@b.com",
            senha: "456"
        },
        {
            id: 3,
            name: "Malu Oliveira",
            email: "m@,.com",
            senha: 321
        }
    ]
}

app.post("/auth", (req, res) => {
    var { email, senha } = req.body;

    if (email != undefined && email != " ") {
        var user = DB.users.find(u => u.email == email);
        if (user != undefined) {
            if (user.senha == senha) {
                jwt.sign({
                    id: user.id,
                    email: user.email
                }, secret, {
                    expiresIn: '48h'
                }, (err, token) => {
                    if (err) {
                        res.status(500).json({ token: "fail" })
                    } else {
                        res.status(200).json({ token: token })
                    }
                });

            } else {
                res.status(404).send({ err: "not found" });
            }
        } else {
            res.status(401).send({ err: "Unauthorized" });
        }
    } else {
        res.status(400).json({ err: "Bad request" })
    }
})
app.get("/", auth, (req, res) => {
    var HATEOAS = [{
            href: "http://localhost:3000/game/0",
            methof: "DELETE",
            rel: "delete_game"
        },
        {
            href: "http://localhost:3000/",
            methof: "GET",
            rel: "get_game"
        },
        {
            href: "http://localhost:3000/auth",
            methof: "POST",
            rel: "login"
        }

    ]

    res.status(200).json({ games: DB.games, _links: HATEOAS })
});

app.get("/game/:id", (req, res) => {

    var id = req.params.id;

    if (!isNaN(id)) {
        var HATEOAS = [{
                href: "http://localhost:3000/game/" + id,
                methof: "DELETE",
                rel: "delete_game"
            },
            {
                href: "http://localhost:3000/games/" + id,
                methof: "PUT",
                rel: "edit_game"
            },
            {
                href: "http://localhost:3000/games/" + id,
                methof: "GET",
                rel: "get_game"
            }

        ]
        var game = DB.games.find(g => g.id == id);
        if (game == undefined)
            res.status(404).json({ error: "no found" })
        else
            res.status(200).json({ game, _link: HATEOAS })
    } else {
        res.status(400).send({ error: "no content" });
    }
});



app.post("/game", (req, res) => {
    var { id, title, year, price } = req.body;
    game = { id, title, year, price }
    DB.games.push(game);
    res.status(200).json(game);
});

app.delete("/game/:id", (req, res) => {
    var id = req.params.id;
    if (!isNaN(id)) {
        var idx = DB.games.findIndex(g => g.id == id);

        if (idx == -1) {
            res.status(404).send();
        } else {
            DB.games.splice(idx, 1);
            res.status(200).send();
        }
    } else {
        res.status(400).send();
    }
});

app.put("/game/:id", (req, res) => {
    var game = DB.games.find(g => g.id == req.params.id);
    var { title, price, year } = req.body;

    if (title != undefined)
        game.title = title;
    if (price != undefined)
        game.price = price;
    if (year != undefined)
        game.year = year;

    res.status(200).send(game);
});

app.listen(3000, () => {
    console.log("Servidor conectado");

})