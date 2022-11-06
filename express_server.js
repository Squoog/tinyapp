const express = require("express");
const cookieSession = require("cookie-session");
const {
  generateRandomString,
  findUserByEmail,
  urlsForUser
} = require("./helpers");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

const users = {
  Egg: {
    id: "Egg",
    email: "egg@farm.com",
    password: "shell",
  },
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": {longURL: "https://www.lighthouselabs.ca", userID: "egg315"},
  "9sm5xK": {longURL: "https://www.google.com", userID: "egg315"},
  "h0h0h0": {longURL: "https://www.dmoj.ca/", userID: "egg315"},
  "w0jb3k": {longURL: "https://www.facebook.com", userID: "egg400"}
};

const userURLs = (id) => {
  const userURLs = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID == id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key0", "key1"],
    maxAge: 24 * 60 * 60 * 1000, // Allot 24h for cookies
  })
);

app.use(express.urlencoded({
    extended: true,
  })
);

// Home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Test json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.use(express.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {

  if (!req.session.user_id) {
    // /res.status(401).send("Request cannot be completed. Please log in.");
    res.redirect("/login");
  }

  const user_id = req.session["user_id"];
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[user_id]
  };
  res.render("urls_index", templateVars);
});

// IMPORTANT: Keep this one before /urls/:id
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    res.redirect('/login');
  }
  const checkURLs = userURLs(user.id);

  let templateVars = {
    urls: checkURLs,
    urlDatabase,
    user
  };
  res.render("urls_new", templateVars);
});

//Edit
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const user = users[userID];

  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user
  }

  if (!(Object.keys(urlsForUser(userID, urlDatabase)).includes(shortURL))) {
    res.status(403).send("You do not have authorization to use this link.");
    return;
  }
  if (!user) {
    res.redirect('/login');
  }
  res.render("urls_show", templateVars);
});

// Adds a new url
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("Please log in to gain access to this.");
  }
  else{
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.user_id};
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(400).send("Invalid URL");
  }
  res.redirect(longURL);
});

// Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL] === undefined) {
    res.status(404).send("ID not found");
    return;
  }
  if (!req.session.user_id) {
    res.status(401);
    return;
  }
  if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("URL cannot be accessed");
    return;
  }
  delete urlDatabase[shortURL];
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  }
  res.redirect("/urls");
});

// Edit
app.post("/urls/:shortURL", (req, res) => {
  const urlTag = req.params.shortURL;
  urlDatabase[urlTag].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPW = req.body.password;
  let userTemp = findUserByEmail(users, userEmail);
  if (userTemp && bcrypt.compareSync(userPW, userTemp.password)) {
    req.session.user_id = userTemp.id;
    return res.redirect("/urls");
  }

  res.status(403).send("No user found.");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  
  let templateVars = {
    user
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {

  const newRandom = generateRandomString(6);
  const newEmail = req.body.email;
  const newPW = req.body.password;
  if (newEmail === "" || newPW === "") {
    res.status(400).send("Email and password cannot be blank!");
    return;
  } else if (findUserByEmail(users, newEmail)) {
    res.status(400).send("Email already registered");
    return;
  }
  const hashedPW = bcrypt.hashSync(req.body.password, 10)
  const user = {
    id: newRandom,
    email: newEmail,
    password: hashedPW,
  };

  users[newRandom] = user;
  console.log(users);
  req.session.user_id = newRandom;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  if (userID) {
    res.redirect("/urls");
    return;
  }

  let templateVars = {
    user: null
  };

  res.render("urls_login", templateVars);
});