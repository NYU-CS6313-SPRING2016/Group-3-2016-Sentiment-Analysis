var mongoose = require('mongoose');
var url = 'mongodb://hipipioo:wwt19921026@ds019960.mlab.com:19960/tweet-sentiment'
mongoose.connect(url, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

