var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var keysRouter = require('./routes/keys');
var walletRouter = require('./routes/wallet');
var authRouter = require('./routes/auth');

let jsonwebtoken = require("jsonwebtoken");
let secretObj = require("./config/jwt");

const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// var options = {
//     swaggerOptions: {
//         authAction: { JWT: { name: "JWT", schema: { type: "apiKey", in: "header", name: "Authorization", description: "" }, value: "Bearer <JWT>" } }
//     }
// };
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/keys', keysRouter);
app.use('/wallet', verify, walletRouter);
app.use('/auth', authRouter);


function verify(req, res, next) {
    // console.log(req.headers);
    let token = req.cookies.user ? req.cookies.user : req.headers.token;
    // let token = req.cookies.user;
    // console.log(req.cookies.user);
    if (!token) {
        res.send("권한이 없습니다.")
        return;
    }
    //console.log(token);
    let decoded = jsonwebtoken.verify(token, secretObj.secret);
    if (decoded) {
        next();
    }
    else {
        res.send("권한이 없습니다.")
    }
}

module.exports = app;
