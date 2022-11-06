const generateRandomString = function (n) {
  let randString = "";
  let characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (let i = 0; i < n; i++) {
    randString += characters.charAt(Math.floor(Math.random() * 36));
  }
  return randString;
};

const findUserByEmail = function (userDatabase, userEmail) {
  for (let id in userDatabase) {
    if (userDatabase[id].email === userEmail) {
      return userDatabase[id];
    }
  }
  return undefined;
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

module.exports = {generateRandomString, findUserByEmail, urlsForUser};