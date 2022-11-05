const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "000000"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "000000"},
};

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

const generateRandomString = function () {
  let randString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < 6; i++) {
    randString += characters.charAt(Math.floor(Math.random() * 36));
  }
  return randString;
};

const emailChecker = (expectedEmail, actualEmail) => {
  return (expectedEmail === actualEmail);
};

const findUserByEmail = function (userDatabase, userEmail) {
  for (let id in userDatabase) {
    if (userDatabase[id].email === userEmail) {
      return userDatabase[id];
    }
  }
  return false;
}

console.log(findUserByEmail(users, "egg@farm.com"));

const userURLs = (id) => {
  const userURLs = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID == id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

const urlsForUser = (id, database) => {
  let userURL = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userURL[shortURL] = database[shortURL];
    }
  }
  return userURL;
};

app.use(cookieParser());
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

  if (!req.cookies.user_id) {
    // /res.status(401).send("Request cannot be completed. Please log in.");
    res.redirect("/login");
  }

  const user_id = req.cookies["user_id"];
  console.log("Test", user_id);
  let templateVars = {
    urls: urlsForUser(req.cookies.user_id, urlDatabase),
    user: users[user_id]
  };

  console.log(templateVars.urls);
  res.render("urls_index", templateVars);
});

// IMPORTANT: Keep this one before /urls/:id
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
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
  const userID = req.cookies.user_id;
  const user = users[userID];

  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user
  }

  console.log(Object.keys(urlsForUser(userID, urlDatabase)));
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
  if (!req.cookies.user_id) {
    res.status(401).send("Please log in to gain access to this.");
  }
  else{
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies.user_id};
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
  if (!req.cookies.user_id) {
    res.status(401);
    return;
  }
  if (req.cookies.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("URL cannot be accessed");
    return;
  }
  delete urlDatabase[shortURL];
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  }
  res.redirect("/urls");
});

// Edit
app.post("/urls/:shortURL", (req, res) => {
  const urlTag = req.params.shortURL;
  urlDatabase[urlTag].longURL = req.body.longURL;
  console.log("Link edit");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPW = req.body.password;
  let userTemp = findUserByEmail(users, userEmail);
  console.log(userTemp);
  console.log(userTemp.password);
  if (userTemp && bcrypt.compareSync(userPW, userTemp.password)) {
    res.cookie("user_id", userTemp.id);
    return res.redirect("/urls");
  }

  res.status(403).send("No user found.");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  
  let templateVars = {
    user
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  let emailTemp = req.body.email;

  console.log(emailTemp);

  let existing = findUserByEmail(users, emailTemp)

  if (emailTemp === "") {
    res.status(400).send("Email cannot be blank!");
    return;
  } else if (emailTemp === existing.email) {
    res.status(400).send("Email already registered");
    return;
  }
  const hashedPW = bcrypt.hashSync(req.body.password, 10)
  const user = {
    id: randomID,
    email: emailTemp,
    password: hashedPW,
  };

  users[randomID] = user;
  console.log(users);
  res.cookie("user_id", randomID);
  res.redirect("/urls");
});

// app.get("/urls/:shortURL", (req, res) => { // still need?
//   const userID = req.cookies.user_id;
//   const user = users[userID];

//   if (!req.cookies.user_id) {
//     res.status(401).send("Please log in to access this link.");
//   } else if (req.cookies.user_id !== urlDatabase[req.params.id].userID) {
//     res.status(403).send("You do not have authorization to use this link.");
//   }

//   let templateVars = {
//     shortURL: req.params.shortURL,
//     longURL: urlDatabase[req.params.shortURL],s
//     user
//   };
//   res.render("urls_show", templateVars);
// });

app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;

  if (userID) {
    res.redirect("/urls");
    return;
  }

  let templateVars = {
    user: null
  };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {});