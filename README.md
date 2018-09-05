# In Your Fridge
-------------------
In Your Fridge is a web application that allows users to search for recipes based upon a limited list of ingredients. The backend allows for storage of user credentials, saved ingredients, and favorite recipes.

[Live Demo!](http://ec2-18-222-193-161.us-east-2.compute.amazonaws.com/)

[Workflow](https://trello.com/b/mWgkC5Kg/in-your-fridge)

![inyourfridge-in-action](https://github.com/hglasser/In-Your-Fridge/blob/master/inyourfridge-in-action.gif)

## Authors
--------------
* Brandon Humphries
* Hannah Glasser
* Tracy Musiker

## Who is our user?
------------------- 
Home chefs that are restricted greatly by the amount of time and variety of ingredients they have available. 

## What is their problem?
-------------------
They want to quickly find recipes that utilize the ingredients they already have at home. They may also want search for recipes that are quick to complete.

## Our Solution
-------------------
In Your Fridge allows users to input the staple ingredients they always have around the house - these ingredients will be stored in our database so they never have to input those again. The user may also input 'Extras', and both of these lists will be used to generate a list of five recipes - ordered by time and title. If the user comes across a recipe they want to save for later, they can easily favorite that recipe and it will be stored for them.

### Issues We Faced
-------------------
Retrieving usable data from promise chaining: Understanding the concept of a nested ".then" resulting in a promise, including within the innermost nest, the method of extracting that data. In this, we gained more insight into how promise chaining results nusable datable, which is unlike  the convention of waiting until the end of most functions to have that data resolve to something usable.

Switching from front-end external API fetch requests to back-end (specifically to keep API keys secure). The concept that all dialogue with databases to front-end is done through the back-end, as mediator. This concept became more clear as we worked to develop this application, and saw the necessity of the external API call to be moved to the back-end. 

## Styling
----------
With the application name of "in your fridge," we selected a fridge image first and then chose our color theme of toned-down blue, greys, and purple, around it. Rounded edges on our modals, and a minimalistic look kept our application looking contemporary. A notepad with staples listed provided a familiar presentation.

### Bootstrap
------------
Bootstrap, a HTML, CSS and JavaScript library, a robust styling tool, gave more power in achieving the aesthetic we desired in our application.

## Libraries
------------

### Express
--------------
This provided our back-end (Node.Js) a concise and easy to use method of establishing routes for our post and get requests.

It also gave us the ability to load our static pages: style sheets, html, and JavaScript, with less code.

### jwt
--------------
We utilized JSON Web Tokens throughout the entirety of our applicaiton. A user would be assigned a token upon verification of their email and password after they logged in or after they created a user profile while signing up. That token would then be stored in their local storage and would remain in their local storage for as long as they remained on the page and did not log out. The library verified those tokens for us - and in this case we allowed all of our tokens to remain valid for a period of 7 days. 

The main, and rather necessary, perk of using this library was that a user would not have to provide their login information every time they wanted to make a request on our page - we did this all on the backend after passing along that token that had originally been stored on the frontend.

### fetch-node
------------
A library that allowed us to transition Fetch API functionality of fetching of resources (built-in to later versions of JavaScript) to Node.js.

In particular, we used this for our requests/responses to the external API used in this application, Spoonacular.
 
