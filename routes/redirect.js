const express = require('express')
const app = express()
require('dotenv').config({path:'../.env'});
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { token } = require('morgan');
const { signIn, welcome, charts, reports, refresh, logout, datatable, picker, student, aplicados,estado ,ex } = require('../controllers/handlers')

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}));
app.use('/resources', express.static(__dirname + '/public'));
app.set('view engine','ejs');
app.use(session({
    secret: 'secret',
   resave: false,
   saveUninitialized: false
}));

app.get('/',  (req, res)=> {
	if (req.session.loggedin) {
		res.render('inicio',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('login',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
	});
app.post('/signin', signIn)
app.get('/welcome', welcome)
app.post('/refresh', refresh)
app.get('/logout', logout)
app.get('/charts', charts)
app.get('/reports', reports)
app.get('/get_data_inicio', datatable)
app.post('/picker', picker)
app.get('/student',  student )
app.get('/aplicados',  aplicados )
app.get('/estado',  estado )
app.get('/ex',  ex )
app.get('/equipos', function(req, res, next) {
    res.render('equipos', { title: 'Express' });
  });


module.exports = app;
