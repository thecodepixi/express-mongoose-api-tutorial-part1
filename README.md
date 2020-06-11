### [Click here to read this article on my blog instead](https://thecodepixi.dev/blog)

> This is a continuation of a series on Express. If you have never used Express before I recommend [starting here](https://thecodepixi.dev/blog/your-first-express-server) instead.

> This is Part 1 of a 2 part series. Part 2 coming soon...

To get started with writing a REST API with Express, we first need to set up our project folder.

Let's open up a terminal and `cd` into where ever we want to work on our coding projects. For me, that's `cd code`.

Then we want to create a new folder for our project to live in, and initialize our `package.json`:

```bash
$ mkdir express-rest-api
$ cd express-rest-api
$ yarn init -y
```

_I'm choosing to use `yarn` as my package manager, but you can use `npm` if you prefer. Both will work the same for this project_

Now we need to add all of the dependencies for our project. There are quite a few, so let's go over them quickly, one by one:

- `express` : Express is a [minimal and flexible Node.js web application framework](expressjs.com).
- `nodemon` : [Nodemon](https://nodemon.io/) is a utility that automatically restarts your server on save to provide "hot reloading" and increased efficiency (_this will be installed as a `devDepenency`_)
- `dotenv` : Dotenv allows us to store private/secret information (like our MongoDB URI) in a `.env` file and access that information using a variable instead of plain text inside our code.
- `cors`: CORS stands for 'Cross Origin Resource Sharing'. We'll get into what that means a little later on when we start sending things like POST requests.
- `mongoose`: Mongoose is the MongoDB framework that we'll be using to create our database `Schema` and access our database models. (_you can build this without Mongoose and just use MongoDB but I personally really enjoy Mongoose and find it to be a useful tool_)

We can add most of these packages in a single command from our terminal:

```bash
$ yarn add express cors mongoose dotenv
```

Then we can add `nodemon` to our `devDependencies` by adding the `-D` flag:

```bash
$ yarn add -D nodemon
```

## Basic Express Server Setup

The "entry point" for this project is `index.js` so we can create that using `touch index.js` and then open that file in our favorite code editor (I'm using VS Code).

The first thing we want to do is set up our basic Express server. Most of this process is covered in the [first part of this series](https://thecodepixi.dev/blog/your-first-express-server), so I won't go into too much detail on this here...

```js
// index.js
const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

```json
/* add these to the scripts section in your package.json */
/* (or create scripts if it does not exist) */
"scripts": {
  "dev": "nodemon index",
  "run": "node index"
}
```

Now you can run `yarn run dev` (_or `npm run dev`_) from the terminal and you should see your console log `"Server running on port 5000"`. If you change the string inside the `console.log`, since we are using nodemon, when you save the file you should see the terminal register that the server has restarted, and you should see your updated output logged in the terminal.

🎉 Now we can start building our API!

Since "To Do" apps are _**so**_ 2018, we're going to be building an API to store and receive data about puppies. 🐶

## MongoDB Setup

First, since we're going to be using MongoDB as our database, coupled with the Mongoose framework, there's some setup that needs to be done to get a MongoDB Atlas account set up.

MongoDB has a great tutorial on that [here](https://docs.atlas.mongodb.com/getting-started/) that you should follow. When you have your MongoDB Atlas setup, come back here when you get to **Step 5** of their tutorial and we'll move on to the next step together...

<!-- WELL, WE'RE WAITING GIF -->

![Well, We're Waiting!](https://media.giphy.com/media/oT7ATDykMidsk/source.gif)

## Oh, Great! You're Back!

So now you should have your MongoDB Atlas URI available. The string should look something like this:

```
mongodb+srv://<username>:<password>@clustername.mongodb.net/<dbName>?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true
```

We're going to add an `.env` file to our project, and store this string (replacing `username`, `password` with your cluster admin info).

First we'll `touch .env` inside of our project directory, and then we'll add the following to that file:

```
  ATLAS_URI=mongodb+srv://yourUsername:yourPassword@clustername.mongodb.net/puppies?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true
```

You can see we replaced `<username>` with `yourUsername` (your Atlas admin username), and `<password>` with `yourPassword` (your Atlas admin password).

We also replaced `<dbName>` with `puppies`, which is what our database will be called when it gets added to our MongoDB Atlas Cluster.

Now we want to add this info to `index.js` so our app can connect to MongoDB via Mongoose:

```js
//add require statements for mongoose, cors, and body-parser (for parsing json)
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

//require dotenv to access variables inside .env
require('dotenv').config();

//tell our express app to use cors and bodyParser
app.use(cors());
app.use(bodyParser.json());

//connect our app to MongoDB with Mongoose
const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;

//open our MongoDB connection
connection.once('open', () => {
  console.log('MongoDB connection established');
});
```

Now, if you're still running your server you should see `"MongoDB connection established"` output to your console! If you're _not_ still running your server, start it using the `dev` script we created earlier, and you should see both the `Server running` and the `MongoDB connection` logs in your terminal

_\*\*If you run into any errors with your MongoDB connection you may need to add a second argument to your `mongoose.connect()` function with the follow:_

```json
{
  "useNewUrlParser": true,
  "useUnifiedTopology": true,
  "useCreateIndex": true
}
```

_However, since these options are specified in the our `ATLAS_URI`, we hopefully shouldn't run into any errors._

## Creating our Model and Schema

Since we're building a relatively simple API, we're just going to have one model and one schema. We're going to put this model in a folder called `Models`

```bash
$ mkdir models
$ touch models/Puppy.model.js

```

To create our Schema we need to `require('mongoose')` and create a Schema variable:

```js
//Puppy.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const puppySchema = new Schema({});

const Puppy = mongoose.model('Puppy', puppySchema);

module.exports = Puppy;
```

![A Basket Full O' Puppies](https://media.giphy.com/media/gcXcSRYZ9cGWY/source.gif)

We're going to put the definitions for all of the keys of our `Puppy` model in the `new Schema({})` assigned to `puppySchema`. MongoDB offers all of the standard data types, and Mongoose provides validations for these types. We'll be exploring a few different data types and validations with this model.

We want all of our `Puppies` to have a `name`, `age`, and `breed`, and we're also going to give them each `Boolean` values of `cute`,`well-behaved`, and `adopted`.

Let's add these to our `Schema` (_I've included code comments to explain the validations and typing along the way_):

```js
//Puppy.model.js
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const puppySchema = new Schema({
  name: {
    //we want each name to be a string
    type: String,
    //puppies have to have names!
    required: true,
    //this will remove trailing whitespace from the string
    trim: true,
    //each puppy name must be at least 3 characters long
    minLength: 3,
  },
  breed: {
    //breed has the same requirements as name
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
  age: {
    //we'll be using ages in months
    type: Number,
    //even puppies can't be ageless
    required: true,
    //puppies can't have negative ages
    min: 0,
    //once they get about 12 months, they're not puppies anymore!
    max: 12,
  },
  cute: {
    // you're either cute or you're not
    type: Boolean,
    required: true,
  },
  well-behaved: {
    type: Boolean,
    required: true
  },
  adopted: {
    type: Boolean,
    required: true
  }
})

const Puppy = mongoose.model("Puppy", puppySchema)

module.exports = Puppy
```

🎉🎉🎉 We did it! We've got our basic Express server hooked up to our own MongoDB cluster, and we've created our first Model Schema using Mongoose.

It's time to take a well deserved break, get up, drink some water, and stretch out those typing fingers.

Next week we'll be going through the process to set up all of our API endpoints, using Mongoose to access information from our database, and accomplish all of the CRUD actions through our API.

If you want to find out when I put out new blog posts and tutorials, you can [follow me on Twitter](https://twitter.com/thecodepixi), where I always post links as soon as my new posts are available.

I also cross-post all of my articles to [DEV](https://dev.to/thecodepixi) if you prefer to read articles and tutorials there.

<!-- LINK TO PART 2 WHEN AVAILABLE -->
