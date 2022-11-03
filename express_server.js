const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  Egg: {
    username: "Egg",
    password: "shell"
  }
}

const generateRandomString = function() {
  let randString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890"
  for (let i = 0; i < 6; i++) {
    randString += characters.charAt(Math.floor(Math.random() * 36));
  }
  return randString;
}

app.use(cookieParser());
app.use(express.urlencoded({
  extended: true
}));

// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(express.urlencoded({ extended: true }));

// Test json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Test link
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

// IMPORTANT: Keep this one before /urls/:id
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

// Adds a new url
app.post("/urls", (req, res) => {
  console.log(req.body);
  const randomUrl = generateRandomString();
  urlDatabase[randomUrl] = req.body.longURL;
  res.redirect("/urls");
});

// Delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

// Edit
app.post("/urls/:id", (req, res) => {
  const urlTag = req.params.id;
  urlDatabase[urlTag] = req.body.longURL;
  console.log("Pressed Edit");
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  let username = req.body.username;
  if (username) {
    res.cookie("username", username);
    res.redirect("/urls");
  }
  else{
    res.send("No username");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  res.redirect("/urls");
})