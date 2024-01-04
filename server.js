// /*  EXPRESS */
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const passportConfig = require('./services/passport/passport');
const bodyParser = require('body-parser');
const googleRouter = require('./routes/routeGoogle');
const naverRouter = require('./routes/routeNaver');
const userRouter = require('./routes/routeUser');
const checkRouter = require('./routes/routeCheck');
// const testUserRouter = require('./routes/routeTestUser');
const resultRouter = require('./routes/routeResult');

dotenv.config();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(fileUpload({
    createParenPath: true
}))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(express.urlencoded());


app.set('view engine', 'ejs');

passportConfig(app);

app.use(session({
    key: "loginData",
    resave: false,
    saveUninitialized: false,
    secret: 'SECRET',
    cookie: {
        secure: false,
        httpOnly: true,
    }
}));

//passport 설정
app.use(passport.initialize());
app.use(passport.session());

//header 설정
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
    next();
});


//model sequelize
const db = require("./models");
db.sequelize.sync();

//Using routes
app.use('/api/users', userRouter);
app.use('/api/results', resultRouter);
app.use('/auth/google', googleRouter);
app.use('/auth/naver', naverRouter);
app.use('/api/checks', checkRouter);

//listening to the server
app.listen(process.env.PORT, () => {
    console.log(`Server is listening at ${process.env.PORT}`);
});

module.exports = app;
