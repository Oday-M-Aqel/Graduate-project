const jwt = require('jsonwebtoken');
const User = require('../nodejs/Database/models/users');


const path = require('path');
const multer = require('multer');
const secretKey = 'OdayIsNerd';
module.exports.checkAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token) {
        jwt.verify(token, secretKey, (err, DToken) => {
            if(err) {
                res.redirect('/login');
            }else {
                next();
            }
        });
    }else {
        res.redirect('/login');
    }
}

module.exports.isLoggedIn = async (req, res, next) => {
    const token = req.cookies.jwt;
    if(token) {
        jwt.verify(token, secretKey, (err, DToken) => {
            if(!err) {
                res.redirect('/home');
            }
        });
    }
    next();
}


var store = multer.memoryStorage({
    destination: function(req, file, cb) {
        cb(null, 'images/');
    },
    filename: function(req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now + ext)
    }
});

module.exports.upload = multer({
    storage: store,
    fileFilter: function(req, file, callback) {
        if(file.mimetype == "image/png" || file.mimetype == "image/jpg"){
            callback(null, true);
        }else{
            console.log('Just png and jpg');
            callback(null, false);
        }
    },
});
