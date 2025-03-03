
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const db  = require('../config/db/db');
const jwtKey = 'my_secret_key'
const jwtExpirySeconds = 3000

//const busca = require("fast-csv");
const fs = require('node:fs');
const ws = fs.createWriteStream("./public/users.json");
var data_exporter = require('json2csv').Parser;
const csvtojson = require('csvtojson');


 function generateAccessToken(user) { 
    return jwt.sign({ user }, jwtKey, {
            algorithm: 'HS256',
            expiresIn: Date.now() + 60 * 1000
            })
  }

const signIn = async (req, res) => {

	try {
		const user = req.body.user;
		const pass = req.body.pass; 

		if (typeof user !== 'string') {
			res.json("No data received");
		  }else{



			let passwordHash = await bcrypt.hash(pass, 8);
			if (user && pass) {
				db.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields)=> {
					if( results.length == 0 || !(await bcrypt.compare(pass, results[0].pass)) ) {    
						res.render('login', {
								alert: true,
								alertTitle: "Error",
								alertMessage: "USUARIO y/o PASSWORD incorrectas",
								alertIcon:'error',
								showConfirmButton: true,
								timer: false,
								ruta: ''    
							});
									
					} else {     

            const accessToken =generateAccessToken(user);
            res.header('authorization',accessToken) 
            res.cookie('accessToken', accessToken, { maxAge: jwtExpirySeconds * 1000 })
            console.log("Token is:" +accessToken); 

												
						if (accessToken) {
									
							  jwt.verify(accessToken, jwtKey, { algorithms: ['HS256'] }, (err, decoded) => {
								if (err) {
								console.error("Token validation failed:", err);
								return;
								}
								console.log("Token is valid:", decoded);
                req.session.loggedin = true;                
                req.session.name = results[0].name;
								res.render('login', {
									alert: true,
									alertTitle: "Conexión exitosa",
									alertMessage: "¡Bienvenido" +" "+ user +"!",
									alertIcon:'success',
									showConfirmButton: false,
									timer: 1500,
									ruta: ''
								}); 
                
                

							});

						} else {

							  res.json({
								login: false,
								data: "error",
							});
						}
    			
					}	
			
					res.end();
			
				});
			} else {	
				res.send('Please enter user and Password!');
				res.end();
			}
		
		}

	} catch (error) {
	  console.log(error);
	}


  };
const welcome = async (req, res) => {
    const token = req.cookies.accessToken
     
    
    if (!token) {
      return res.status(401).end()
    }
  
    var payload
    try {
      
      payload = jwt.verify(token, jwtKey)
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        
        return res.status(401).end()
      }
      
      return res.status(400).end()
    }
  

    res.send(`Welcome ${payload.user}!`)
  }
const charts = async (req, res) => {
    const token = req.cookies.accessToken
  
    
    if (!token) {
      return res.status(401).end()
    }
  
    var payload
    try {
      
      payload = jwt.verify(token, jwtKey)
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        
        return res.status(401).end()
      }
      
      return res.status(400).end()
    }
  

    res.render('charts', { title: 'Express' });
  }
const reports = async (req, res) => {
    const token = req.cookies.accessToken
     
    
    if (!token) {
      return res.status(401).end()
    }
  
    var payload
    try {
      
      payload = jwt.verify(token, jwtKey)
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        
        return res.status(401).end()
      }
      
      return res.status(400).end()
    }
  

    res.render('reports', { title: 'Express' });
  }
const refresh = async (req, res) => {
  
  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).end()
  }

  var payload
  try {
    payload = jwt.verify(token, jwtKey)
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).end()
    }
    return res.status(400).end()
  }

  const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
  if (payload.exp - nowUnixSeconds > 30) {
    return res.status(400).end()
  }

  const newToken = jwt.sign({ user: payload.user }, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpirySeconds
  })

  res.cookie('accessToken', newToken, { maxAge: jwtExpirySeconds * 1000 })
  res.end()
  }
const logout = async (req, res) => {
  const sessionID = req.session.id;
  req.sessionStore.destroy(sessionID, (err) => {
    // callback function. If an error occurs, it will be accessible here.
    if(err){
      return console.error(err)
    }
    console.log("The session has been destroyed!")
  })
  res.cookie('accessToken', '', { maxAge: 0 })
  req.session.destroy(() => {
    res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
  })
  

  }
const datatable = function (req, res) {
  const token = req.cookies.accessToken
  if (!token) {
    return res.status(401).end()
  } else{
    var draw = req.query.draw;
 
    var start = req.query.start;
 
    var length = req.query.length;
 
    var order_data = req.query.order;
 
    if (typeof order_data == 'undefined') {
       var column_name = 'activos.id';
 
       var column_sort_order = 'desc';
    } else {
       var column_index = req.query.order[0]['column'];
 
       var column_name = req.query.columns[column_index]['data'];
 
       var column_sort_order = req.query.order[0]['dir'];
    }
 
    
    var search_value = String(req.query.search['value']);
 
    if(search_value.length > 20)
       {console.log('⛔️👉️  injection bloqued');
 
 
       }
          // si no tiene comentario se procede a restablecer la contraseña
        else{
          var search_query = `
          AND (Estado LIKE '%${search_value}%' 
           OR Descripcion_del_CI LIKE '%${search_value}%' 
           OR id_del_ci LIKE '%${search_value}%' 
           OR Piso LIKE '%${search_value}%'
           OR ID_de_inicio_de_sesion LIKE '%${search_value}%'
           OR telefono LIKE '%${search_value}%'
           OR usuario LIKE '%${search_value}%'
           OR Nombre_Completo LIKE '%${search_value}%'
                    
          )
         `;
       
       
          db.query("SELECT COUNT(Estado) AS Total FROM activos", function (error, data) {
          var total_records = data[0].Total;
       
             db.query(`SELECT COUNT(*) AS Total FROM activos INNER JOIN mfa ON activos.ID_de_inicio_de_sesion = mfa.correo INNER JOIN planilla ON mfa.correo = planilla.correo WHERE 1 ${search_query}`, function (error, data) {
             var total_records_with_filter = data[0].Total;
                var query = `
                 SELECT Estado, Descripcion_del_CI, id_del_ci, Piso, ID_de_inicio_de_sesion,telefono,usuario,Nombre_Completo  FROM activos 
                 INNER JOIN mfa ON activos.ID_de_inicio_de_sesion = mfa.correo 
                 INNER JOIN planilla ON mfa.correo = planilla.correo
                 WHERE 1 ${search_query} 
                 ORDER BY ${column_name} ${column_sort_order} 
                 LIMIT ${start}, ${length}
                 
                 `;
       
                   var usuarios = [];
                    db.query(query, function (error, data) {
                    //var total_records = data[0].Total;
                       data.forEach(function (row) {
                         usuarios.push({
                         'Estado': row.Estado,
                         'Descripcion_del_CI': row.Descripcion_del_CI,
                         'id_del_ci': row.id_del_ci,
                         'Piso': row.Piso,
                         'ID_de_inicio_de_sesion': row.ID_de_inicio_de_sesion,
                         'telefono': row.telefono,
                         'usuario': row.usuario,
                         'Nombre_Completo': row.Nombre_Completo
                            });
                       });
       
                   var output = {
                      'draw': draw,
                      'iTotalRecords': total_records,
                      'iTotalDisplayRecords': total_records_with_filter,
                      'aaData': usuarios
                   };
                   var ext = {
       
                      usuarios
                   };
       
       
                   ////////////////////////////////////////////

       
                   var users = JSON.parse(JSON.stringify(output));
       
                   res.json(users);
 
                   console.log(ext)
       
                });
       
             });
       
       
          });
        }

  }



 
 
 
 
 }
 const picker = async (req, res) => {

  const token = req.cookies.accessToken
  if (!token) {
    return res.status(401).end()
  } else{
   const {start_date,end_date} = req.body;
   sql = `SELECT id, name,created_at,percentage,result,standard FROM student WHERE created_at BETWEEN  "${req.body.start_date}" AND "${req.body.end_date}"`;
   var Student = [];
   db.query(sql, function (error, results) {
  
      results.forEach(function (row) {
         Student.push({
        'id': row.id,
        'name': row.name,
        'standard': row.standard,
        'percentage': row.percentage,
        'result': row.result
           });
      });


      var string=JSON.stringify(results);
      //console.log(string);
      var json =  JSON.parse(string);
      res.json(results);

      var ext = {

         'data': json
      };

     // console.log(ext)
      //////


////////
 


});
  
  }

}


const student = async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) {
    return res.status(401).end()
  } else{
  db.query('SELECT * FROM student', (error, results) => {
     if (error) throw error;
     res.json(results);

  });
  }
}

const aplicados = async(req, res) => {
  const token = req.cookies.accessToken
  if (!token) {
    return res.status(401).end()
  } else{

  //res.sendFile(__dirname + '/index.html');
  db.query('SELECT COUNT(id) AS Total FROM  activos where estado = "aplicado"', (error, results) => {
     var total_aplicados = results[0].Total;
     db.query("SELECT COUNT(id) AS Total FROM activos", function (error, data) {

                 var total_records = data[0].Total;

                 var percentage = [(total_aplicados)*100] /total_records;

                 var num = Math.round(percentage)
                 var aplicado = JSON.parse(JSON.stringify(num));
                 var output = [{
                
                    'aplicados': aplicado
                 }];
           
                 if (error) throw error;
                 res.json(output);
           

     });
     



  });
}
   //res.sendFile(('C:\\Users\\Pro\\Desktop\\SQL\\public\\index.html'));
 
}

const estado = async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) {
    return res.status(401).end()
  } else{
  db.query("SELECT COUNT(id) AS Total FROM activos", function (error, results) {
     db.query('SELECT COUNT(id) AS Total FROM  activos where estado = "aplicado" ', function(errores, datas) {
     db.query('SELECT COUNT(id) AS Total FROM  activos where estado = "En reparacion" ', function(erro, data) {
        db.query('SELECT COUNT(id) AS Total FROM  activos where estado = "Fin de vida util" ', function (err, dat) {
          db.query('SELECT COUNT(id) AS Total FROM  activos where estado = "Fuera de servicio" ', function (er, da) {

              var total_records = results[0].Total;  // total de filas
              
              var total_fix = data[0].Total;  // total de filas en reparacion
              var total_records_life_end = dat[0].Total;  // total de filas finde vida util
              var total_records_out_service  = da[0].Total;  // total de filas
              var total_apply = datas[0].Total;  // total de filas en reparacion

/////////////////////////////////////////////////////////////////


              var percentage = [(total_fix)* 100] / total_records;
              var num = Math.round(percentage)
              var reparacion = JSON.parse(JSON.stringify(num));

////////////////////////Fin de vida util query ///////////////////////////////

var porciento = [(100)*total_records_life_end] / total_records;
var num1 = Math.round(porciento)
var find = JSON.parse(JSON.stringify(num1));

////////////////////////Fuera de servicio ///////////////////////////////

var porcientos = [(100)*total_records_out_service] / total_records;
var num2 = Math.round(porcientos)
var fuera = JSON.parse(JSON.stringify(num2));

var porcientosap = [(100)*total_apply] / total_records;
var num3 = Math.round(porcientosap)
var fuera2 = JSON.parse(JSON.stringify(num3));

//////////////////////

console.log(total_records)
console.log(total_fix)
console.log(total_records_life_end)
console.log(total_records_out_service)
console.log(total_apply)

              var output = [{
                 
                 'reparacion': reparacion,
                 'find': find,
                 'fuera': fuera
              }];
        
              if (error) throw error;
              res.json(output);
        

  });
});
  
});
});
});
  }



//res.sendFile(('C:\\Users\\Pro\\Desktop\\SQL\\public\\index.html'));

}

const ex = async (req, res) => {
  const token = req.cookies.accessToken
  if (!token) {
    return res.status(401).end()
  } else{
  //res.sendFile(__dirname + '/index.html');
  db.query('SELECT player_name, score_avg FROM your_table', (error, results) => {
     if (error) throw error;
     res.json(results);


  });
}
   //res.sendFile(('C:\\Users\\Pro\\Desktop\\SQL\\public\\index.html'));
 
}

module.exports = {
  signIn,
  welcome,
  charts,
  reports,
  refresh,
  logout,
  datatable,
  picker,
  student,
  aplicados,
  estado,
  ex
}
