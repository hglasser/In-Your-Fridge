const jwt = require('jsonwebtoken');
const express = require('express');
const pg = require('pg-promise')();
const {SIGNATURE, name, recipeKey } = require('./variables');
const dbConfig = name;
const db = pg(dbConfig);
const fs = require('fs');
const fetch = require('node-fetch');

//Create token
let createToken = user => {
    let token = jwt.sign(
        {userId: user.id}, 
        SIGNATURE, 
        { expiresIn: '7d'}
    );
    return token;
}

//Read Body helper function 
let readBody = (req, callback) => {
    let body="";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        callback(body);
    })
}

//Post tokens
let postToken = async (req, res) => {
    readBody(req, (body) => {
        let credentials = JSON.parse(body);
        let { email, password } = credentials;
        db.one(`select * from users where users.email = '${email}'`)
            .then(user => {
                if (user.password === password && user.email === email) {
                    let token = createToken(user);
                    res.send(token);
                } else {
                    res.send("Wrong password");
                }
            })
            .catch((err) => {
                res.send("Wrong login information");
                console.log(err)});
    });
}

// GET /.inyourfridge/private
let checkToken = async (req, res, next) => {
    let { authorization: token } = req.headers;
    let payload;
    try {
        payload = jwt.verify(token, SIGNATURE);
    } catch(err) {
        console.log(err);
    }

    if (payload) {
        req.jwt = payload;
        next();
    } else {
        res.send('Woops! you do not have a token!');
    }
};

let orderedByTime = (recipeArr) => {
    recipeArr.sort(function(a, b) {
    if (a[3] > b[3]) return 1;
    if (a[3] < b[3]) return -1;
    if (a[3] === b[3]) {
        if (a[0] > b[0]) return 1;
	    if (a[0] < b[0]) return -1;
    }
    }); 
    return(recipeArr);
};

let getRecipeInfo = function(recipeArrIds) {
    let prefixUrl = 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/informationBulk?ids=';
    let suffixUrl = '&includeNutrition=false';
    let ingreRootUrl = recipeArrIds.join("%2C");
    let fetchPromise = fetch(prefixUrl + ingreRootUrl + suffixUrl, {
        method: "GET",
        headers: {
            "X-Mashape-Key": recipeKey,
            Accept: 'application/json'
        }
    })
        .then(function (result) {
            let promiseRecipes = result.json();
            return promiseRecipes;
        })
        .then(function(recipeObjArr) {
            let newRecipes = recipeObjArr.map(recipe => [recipe.title, recipe.spoonacularSourceUrl, recipe.image, recipe.readyInMinutes, recipe.id]);
            return JSON.stringify(newRecipes);
        })
        .catch(function (err) {
            console.log(err);
        });
    return fetchPromise;
}

let getRecipesfromIngreds = (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
              "Origin, X-Requested-With, Content-Type, Accept, token");
    res.header("Access-Control-Allow-Methods", "*");
    readBody(req, (body) => {
        let foodArr = JSON.parse(body);
        getRecipes(foodArr, res);
    });
}

let getRecipes = (foodArr, res) => {
    let prefixUrl =
    "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients?fillIngredients=false&ingredients=";
    let suffixUrl = "&limitLicense=false&number=5&ranking=2"
    let ingreRootUrl = foodArr.join("%2C");
    fetch(prefixUrl + ingreRootUrl + suffixUrl, {
        method: "GET",
        headers: {
            "X-Mashape-Key": recipeKey,
            Accept: 'application/json'
        }
    })
        .then(function (result) {
            let promiseRecipes = result.json();
            return promiseRecipes;
        })
    .then(function(recipeObjArr) {
        let recipeArrIds = recipeObjArr.map(recipes => recipes.id);
        getRecipeInfo(recipeArrIds, res)
        .then((results) => {
            results = JSON.parse(results);
            results = orderedByTime(results);
            res.send(JSON.stringify(results))})
        .catch(err => console.log(err));
    })
    .catch(function (err) {
        console.log(err);
    });
};

let getIngredientSubstitution = (req, res) => {
    let prefixUrl = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/food/ingredients/substitutes?ingredientName=";
    readBody(req, (body) => {
        let ingredient = JSON.parse(body);
        fetch(prefixUrl + ingredient, {
            method: 'GET',
            headers: {
                "X-Mashape-Key": recipeKey,
                "X-Mashape-Host": "spoonacular-recipe-food-nutrition-v1.p.mashape.com"
            }
        })
            .then((substitutes) => {
                let promiseSubstitutes = substitutes.json();
                return promiseSubstitutes;
            })
        .then((ingredients) => {
            res.end(JSON.stringify(ingredients));
        })
        .catch((err) => {console.log(err)});
    })
};

let postUserSignupInformation = (req, res) => {
    readBody(req, (body) => {
        let userInformation = JSON.parse(body);
        db.query(`INSERT INTO
                        users (email, password)
                        VALUES ('` + userInformation.email + `', '` + userInformation.password + `')`)
            .then((contents) => {
                res.end(JSON.stringify(userInformation));
            })
            .catch((err) => {console.log(err)});
    });
};

let postStaples = (req, res) => {
    readBody(req, (body) => {
        let stapleIngredients = JSON.parse(body);
        let { authorization: token } = req.headers;
        let payload = jwt.verify(token, SIGNATURE);
        let userId = payload.userId;
        db.query(`SELECT * FROM ingredients WHERE userid = ` + userId)
            .then((contents) => {
                if (contents.length === 0) {
                    db.query(`INSERT INTO 
                        ingredients (userid, included)
                        VALUES ('` + userId + `', '{` + stapleIngredients + `}')`)
                        .then((contents) => {
                            res.end('Your staple ingredients have been stored!');
                        })
                        .catch((err) => {console.log(err)});
                }
                else {
                    db.query(`UPDATE 
                        ingredients 
                        SET included = '{` + stapleIngredients + `}'
                        WHERE userid = '` + userId + `'`)
                        .then((contents) => {
                            res.end('Your staple ingredients have been updated!')
                        })
                        .catch((err) => {console.log(err)});
                }
            });
        
    });
};

let getStaples = (req, res) => {
    let { authorization: token } = req.headers;
    let payload = jwt.verify(token, SIGNATURE);
    let userId = payload.userId;
    db.query(`SELECT included FROM ingredients WHERE userid = '` + userId + `'`)
        .then((contents) => {
            let contentsObject = contents[0];
            res.send(JSON.stringify(contentsObject.included));
        })
};

let returnEmail = (req, res) => {
    let { authorization: token } = req.headers;
    let payload = jwt.verify(token, SIGNATURE);
    let userId = payload.userId;
    db.query(`SELECT email FROM users WHERE id = '` + userId + `'`)
        .then((contents) => {
            let contentsObject = contents[0];
            res.send(JSON.stringify(contentsObject.email));
        })
};

let saveLikedRecipes = (req, res) => {
    readBody(req, body => {
        let userId = req.jwt.userId;
        let recipeId = body;
        db.one(`
            INSERT INTO liked (userid, liked, recipeid) 
            VALUES ($1, true, $2)
            RETURNING *;
        `, [parseInt(userId), parseInt(recipeId)])
        .then(data => res.send(data))
        .catch(err => res.send(err));
    })
}

let loadFavorites = (req, res) => {
    db.query (`
        SELECT recipeId 
        FROM liked 
        WHERE userId = $1
        AND liked = true;
        `, req.jwt.userId)
    .then(recipes => recipes.map(recipe => recipe.recipeid))
    .then(recipeids => getRecipeInfo(recipeids))
    .then(recipes => res.send(recipes))
}

let server = express();
server.use(express.static('./public'))
server.get('/retrieveemail', checkToken, returnEmail);
server.get('/favorites', checkToken, loadFavorites);
server.get('/retrieveingredients', checkToken, getStaples);
server.post('/tokens', postToken);
server.post('/users', postUserSignupInformation);
server.post('/staples', checkToken, postStaples);
server.post('/like', checkToken, saveLikedRecipes);
server.post('/ingredients', checkToken, getRecipesfromIngreds);
server.post('/substitutes', checkToken, getIngredientSubstitution);
// server.get('/tokens')
server.listen(3000);
