const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/YKPOCafe').then(() => {
    console.log('Connection Good');
}).catch((err) => {
    console.log(err);
});
