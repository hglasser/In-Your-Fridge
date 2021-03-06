let token;

let closeLogin = () => {
    let loginModalWindow = document.querySelector('.login-modal-container');
    loginModalWindow.classList.add('hidden');
}

let clearDisplayContainers = (container) => {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

let displayUserEmail = () => {
    let localStorageToken = localStorage.getItem("token");
    let parseToken = JSON.parse(localStorageToken);
    let userEmailContainer = document.querySelector('.navigation-user-email-container');
    clearDisplayContainers(userEmailContainer);
    let userEmail = document.createElement('p');
    userEmail.classList.add('navigation-user-email')
    let fetchGet = fetch('/retrieveemail', {
        method: 'GET',
        headers: {'authorization': parseToken}
    }).then(contents => {   
        return contents.text()})
        .then(text => {
            let parsedText = JSON.parse(text);
            userEmail.textContent = parsedText;
            userEmailContainer.appendChild(userEmail);
        })
        .catch(err => console.log(err));
};

let getStaples = () => {
    // let fridgePosition = ['bottom-second', 'bottom', 'top', 'top-second', 'centered']
    let localStorageToken = localStorage.getItem("token");
    let parseToken = JSON.parse(localStorageToken);
    let fetchGet = fetch('/retrieveingredients', {
        method: 'GET',
        headers: {'authorization': parseToken}
    }).then(contents => {
        return contents.text()})
        .then(text => {
            let ingredientsArray = JSON.parse(text);
            ingredientsArray.forEach(item => {
            // let positionForStaple = fridgePosition[Math.floor(Math.random() * fridgePosition.length)]
                displayIngredient('staples', item);
                // displayIngredient('staples', item, positionForStaple);
            })
        });
};

let getToken = () => {
    let checkToken = localStorage.getItem("token");
    if (checkToken !== null) {
        displayUserEmail();
        closeLogin();
        getStaples();
        return checkToken;
    } else {
        return null;
    }
}

token = getToken();
                                      
let loginButtonStatus = () => {
    let checkToken = localStorage.getItem("token");
    let logoutButton = document.querySelector('.logout-button');
    let fridgeImage = document.querySelector('.fridge');
    if (checkToken === null) {
        fridgeImage.setAttribute('src', './fridge-closed.jpg');
        logoutButton.textContent = 'Log In';
        document.querySelector('.view-saved')
          .classList.add('hidden');
    }
    else if (checkToken !== null) {
        fridgeImage.setAttribute('src', './fridge-open.jpg');
        logoutButton.textContent = 'Log Out';
        document.querySelector('.view-saved')
        .classList.remove('hidden');
    }
};

loginButtonStatus();

let loginLogout = () => {
    let loginModalWindow = document.querySelector('.login-modal-container');
    let logoutButton = document.querySelector('.logout-button');
    let staplesOutput = document.querySelector('.staples-output');
    let userEmailContainer = document.querySelector('.navigation-user-email-container');
    let userEmail = document.querySelector('.navigation-user-email');
    let extrasOutput = document.querySelector('.extras-output');
    let recipes = document.querySelector('.recipes-container');
    let substitutions = document.querySelector('.ingredient-substitutions');
    let substitutionsInput = document.querySelector('.substitute-ingredient-input');
    if (logoutButton.textContent === 'Log Out') {
        userEmailContainer.removeChild(userEmail);
        localStorage.removeItem("token");
        clearDisplayContainers(staplesOutput);
        clearDisplayContainers(extrasOutput);
        clearDisplayContainers(recipes);
        clearDisplayContainers(substitutions);
        substitutionsInput.value = '';
        loginButtonStatus();
    } else if (logoutButton.textContent === 'Log In') {
        loginModalWindow.classList.remove('hidden');
    }
};

let loginAfterSignup = (credentials) => {
    fetch('/tokens', {
        method: 'POST',
        body: credentials,
        headers: {'Content-Type': 'application/json'}
    }).then(results => {
        return results.text()})
        .then(text => {
            localStorage.setItem("token", JSON.stringify(text))
            displayUserEmail();
            loginButtonStatus();
        });
};

let postSignupInformation = (signupInformation) => {
    console.log(signupInformation);
    let fetchPost = fetch('/users', {
        method: 'POST',
        body: JSON.stringify(signupInformation),
        headers: {'Content-Type': 'application/json'}
    }).then((contents) => {
        return contents.text()})
        .then(credentials => {
            loginAfterSignup(credentials);
        })
        .catch((err) => {console.log(err)});
};

let captureUserCredentials = (prefix) => {
    let userCredentials = {};
    let userEmail = document.querySelector('.' + prefix + '-email-input');
    let userPassword = document.querySelector('.' + prefix + '-password-input');
    userCredentials.email = userEmail.value;
    userCredentials.password = userPassword.value;
    console.log(userCredentials);
    let loginModalWindow = document.querySelector('.login-modal-container');
    loginModalWindow.classList.add('hidden');
    return userCredentials;
};

let deleteIngredient = (event) => {
    var deleteButton = event.target;
    var parent = deleteButton.parentElement;
    parent.parentNode.removeChild(parent);
}
// let displayIngredient = function(prefix, input, positionForStaple)
let displayIngredient = function(prefix, input) {
    let output = document.querySelector('.' + prefix + '-output');
    let item = document.createElement('div');
    let text = document.createElement('div');
    let deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'submit');
    deleteButton.textContent = 'x';
    deleteButton.classList.add(prefix +'-delete-button', 'btn', 'btn-danger');
    deleteButton.addEventListener('click', deleteIngredient);
    text.textContent = input;
    item.appendChild(text);
    item.appendChild(deleteButton);
    item.classList.add(prefix + '-item-output');
    // item.classList.add(positionForStaple);
    output.appendChild(item);
}

let getStapleInput = (event) => {
    event.preventDefault();
    let staplesInput = document.querySelector('.staples-input');
    displayIngredient('staples', staplesInput.value);
    staplesInput.value = "";
};

let getExtraInput = (event) => {
    event.preventDefault();
    let extraInput = document.querySelector('.extras-input');
    displayIngredient('extras', extraInput.value);
    extraInput.value = "";
};

let displayRecipes = (recipes, boolean) => {
    let recipesContainer;
    if (boolean === true) {
        recipesContainer = document.querySelector('.modal-body');
    } else {
        recipesContainer = document.querySelector('.recipes-container');
    }
    while (recipesContainer.firstChild) {
        recipesContainer.removeChild(recipesContainer.firstChild);
        }
    recipes.forEach(item => {
        let recipeHeart = document.createElement('h1');
        let recipe = document.createElement('div');
        let recipeName = document.createElement('p');
        let recipeTime = document.createElement('p');
        let recipeURL = document.createElement('a');
        let recipePhoto = document.createElement('img');
        recipe.classList.add('recipe');
        recipeHeart.textContent= "♥";
        recipeName.classList.add('recipe-name');
        recipePhoto.classList.add('recipe-photo');
        recipeURL.classList.add('recipe-url');
        recipeTime.textContent = ` ${item[3]} Minutes`
        recipeName.textContent = item[0];
        recipePhoto.setAttribute('src', item[2]);
        recipeHeart.setAttribute('class', 'heart')
        recipeTime.setAttribute('class', 'recipe-time')
        recipeURL.setAttribute('href', item[1]);
        recipeURL.setAttribute('target', '_blank');
        recipeURL.setAttribute('rel', 'noopener noreferrer');
        recipeURL.appendChild(recipePhoto);
        recipe.appendChild(recipeTime);
        recipe.appendChild(recipeName);
        recipe.appendChild(recipeURL);
        recipe.appendChild(recipeHeart);
        recipeHeart.addEventListener('click',() => likeRecipe(item[4]));
        recipesContainer.appendChild(recipe);
        if (boolean === true) {
            recipeHeart.classList.add("selected")
        } 
    });
};

// let turnHeartRed = () => {
//     let heart = document.querySelector('.heart')
//     heart.classList.toggle("selected")
// }

let likeRecipe = (id) => {
    event.target.classList.toggle("selected");
    return fetch('/like', {
        method: "POST",
        body: JSON.stringify(id),
        headers: {'Content-Type': 'application/json', 
        'authorization': JSON.parse(localStorage.getItem("token"))}
    }).then(res => res.json())
    .then(res => console.log(res));
}

let showLikedRecipes = () => 
    fetch('/favorites', { 
        method: 'GET',
        headers: {
            'authorization': JSON.parse(localStorage.getItem("token")),
            'Content-Type': 'application/json'
        }
    }).then(data => data.json())
    .then(data => displayRecipes(data, true))

let postIngredients = (prefix, ingredients) => {
    let localStorageToken = localStorage.getItem("token");
    let parseToken = JSON.parse(localStorageToken);
    let fetchPost = fetch(`/${prefix}`, {
        method: 'POST',
        body: JSON.stringify(ingredients),
        headers: {'Content-Type': 'application/json', 
        'authorization': parseToken}
    }).then((contents) => {
        return contents.json();
    }).then((results) => {
        displayRecipes(results, false);
        console.log(results);
    })
}

let getConfirmedIngredients = (event) => {
    event.preventDefault();
    let stapleValues = [];
    let allIngredients = [];
    let recipesContainer = document.querySelector('.recipes-container');
    while (recipesContainer.firstChild) {
        recipesContainer.removeChild(recipesContainer.firstChild);
    };

    //Create an array that holds all of the staples
    let staples = document.querySelectorAll('.staples-item-output');
    staples.forEach(staple => {
        stapleValues.push(staple.firstChild.textContent);
    });
    postIngredients('staples', stapleValues);
    allIngredients = stapleValues;

    //Add extras to allIngredients array
    let extras = document.querySelectorAll('.extras-item-output');
    extras.forEach(extra => {
        allIngredients.push(extra.firstChild.textContent);
    });

    postIngredients('ingredients', allIngredients);
    return allIngredients;
}

let displayIngredientSubstitutions = (substitutions) => {
    substitutions.forEach((substitute) => {
        let ingredientSubstitutionContainer = document.querySelector('.ingredient-substitutions')
        let ingredientSubstitution = document.createElement('p');
        ingredientSubstitution.classList.add('ingredient-substitution');
        ingredientSubstitution.textContent = substitute;
        ingredientSubstitutionContainer.appendChild(ingredientSubstitution);
    })
};

let displayNoIngredientSubstitutions = () => {
    let ingredientSubstitutionContainer = document.querySelector('.ingredient-substitutions');
    let noSubstitutionsMessageContainer = document.createElement('p');
    let noSubstitutionsMessage = 'Could not find any substitutions for that ingredient.'
    noSubstitutionsMessageContainer.textContent = noSubstitutionsMessage;
    ingredientSubstitutionContainer.appendChild(noSubstitutionsMessageContainer);
}

let getSubstituteIngredients = (event) => {
    event.preventDefault();
    let localStorageToken = localStorage.getItem("token");
    let parseToken = JSON.parse(localStorageToken);
    let ingredient = document.querySelector('.substitute-ingredient-input');
    let fetchPost = fetch('/substitutes', {
        method: 'POST',
        body: JSON.stringify(ingredient.value),
        headers: {'Content-Type': 'application/json', 
        'authorization': parseToken}
    }).then((contents) => {
        return contents.json();
    }).then((results) => {
        if (results.status === 'failure') {
            displayNoIngredientSubstitutions();
        } else {
            displayIngredientSubstitutions(results.substitutes);    
        }
    })
};

let showSignupContainer = () => {
    let signupContainer = document.querySelector('.signup-modal-container');
    let loginContainer = document.querySelector('.login-input-container');
    signupContainer.classList.remove('hidden');
    loginContainer.classList.add('hidden');
    document.querySelector('.view-saved')
            .classList.add('hidden');
};

let clearUserInformationInput = (prefix) => {
    let userEmail = document.querySelector('.' + prefix + '-email-input');
    let userPassword = document.querySelector('.' + prefix + '-password-input');
    userEmail.value = '';
    userPassword.value = '';
}

let submitSignupInfo = (event) => {
    event.preventDefault();
    let userCredentials = captureUserCredentials('signup');
    postSignupInformation(userCredentials);
    clearUserInformationInput('signup');
};

let submitLoginInfo = (event) => {
    event.preventDefault();
    captureUserCredentials('login');
    let credentials = captureUserCredentials('login');
    clearUserInformationInput('login');
    let wrongPass = document.querySelector('.wrong-password');
    wrongPass.classList.add('hidden');
    let wrongUser = document.querySelector('.wrong-login-info');
    wrongUser.classList.add('hidden');
    fetch('/tokens', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {'Content-Type': 'application/json'}
    }).then(results => {
        return results.text()})
        .then(text => {
            if (text === "Wrong login information") {
                clearUserInformationInput('login');
                let wrongUser = document.querySelector('.wrong-login-info');
                wrongUser.classList.remove('hidden');
                let loginContainer = document.querySelector('.login-modal-container');
                loginContainer.classList.remove('hidden');
            } else if (text === "Wrong password") {
                clearUserInformationInput('login');
                let loginContainer = document.querySelector('.login-modal-container');
                loginContainer.classList.remove('hidden');
                let wrongPass = document.querySelector('.wrong-password');
                wrongPass.classList.remove('hidden');
            } else {
                localStorage.setItem("token", JSON.stringify(text))
                getStaples();
                displayUserEmail();
                document.querySelector('.view-saved')
                .classList.remove('hidden');
                loginButtonStatus();
            }

        });
};

let backToLogin = (event) => {
    event.preventDefault();
    let signupContainer = document.querySelector('.signup-modal-container');
    let loginContainer = document.querySelector('.login-input-container');
    signupContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    document.querySelector('.view-saved')
            .classList.add('hidden');
};

let setupEventListeners = () => {
    let backToLoginButton = document.querySelector('.back-to-login-button');
    backToLoginButton.addEventListener('click', backToLogin);

    let submitLoginInformation = document.querySelector('.login-form');
    submitLoginInformation.addEventListener('submit', submitLoginInfo);

    let submitSignupInformation = document.querySelector('.signup-form');
    submitSignupInformation.addEventListener('submit', submitSignupInfo);

    let signupWindowButton = document.querySelector('.signup-window-button');
    signupWindowButton.addEventListener('click', showSignupContainer);

    let closeLoginWindow = document.querySelector('.close-login-modal-button');
    closeLoginWindow.addEventListener('click', closeLogin);

    let staplesBtn = document.querySelector(".staples-submit");
    staplesBtn.addEventListener("click", getStapleInput);

    let confirmIngredients = document.querySelector('.confirm-ingredients');
    confirmIngredients.addEventListener('click', getConfirmedIngredients)

    let extrasBtn = document.querySelector(".extras-submit");
    extrasBtn.addEventListener("click", getExtraInput);

    let logoutButton = document.querySelector('.logout-button');
    logoutButton.addEventListener('click', loginLogout); 
    
    let showRecipesInNav = document.querySelector('.view-saved');
    showRecipesInNav.addEventListener('click', () => showLikedRecipes());

    let ingredientToSubstitute = document.querySelector('.substitute-ingredient');
    ingredientToSubstitute.addEventListener('submit', getSubstituteIngredients);
}

setupEventListeners();