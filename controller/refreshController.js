const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;

  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );

  if (!foundUser) return res.sendStatus(403); // forbidden

  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);

    const role = foundUser.role;

    //creat JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          role: role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "2m" }
    );
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
