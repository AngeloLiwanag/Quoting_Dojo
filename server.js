var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('express-flash');
var path = require('path');
var session = require('express-session')

app.use(session({
    secret:"secretkey",
    resave:false,
    saveUninitialized: true,
    cookie: {maxAge: 6000}
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, './static')));
app.use(flash());

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/quote');
mongoose.Promise = global.Promise;

var dataSchema = new mongoose.Schema({
    name: {type: String, required: true},
    quote: {type: String, required: true}
}, {timestamps: true});

mongoose.model("data", dataSchema);
var Data = mongoose.model("data");

// localhost:8000 --- Index Page
app.get('/', function(req, res){
    res.render('index');
});

// Index Page --- Data Form 
app.post('/data', function(req, res){
    // console.log("POST DATA", req.body)
    var data = new Data({name: req.body.name, quote: req.body.quote});
    data.save(function(err){
        if(err){
            console.log('something went wrong', err);
            for (var key in err.errors){
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        } else {
            console.log('successfully added data!')
            res.redirect('/quotes')
        }
    });
});

// localhost:8000 --- Quotes Page
app.get('/quotes', function(req, res){
    Data.find({}, function(err, data){
        if(err){
            console.log('something went wrong')
        }
        res.render('quotes', {quotes: data})
    });
});

app.listen(8000, function(){
    console.log("listening on port 8000");
});
