const express = require('express');
const router = express.Router();
const db = require('../config/db/db');

router.get('/api/intervals/:start&:end', function (req, res) {
   sql = `SELECT id, name,created_at,percentage,result,standard FROM student WHERE created_at BETWEEN  "${req.params.start}" AND "${req.params.end}"`;
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

      var ext = {

         'data': results
      };


      //var string=JSON.stringify(results);
      //console.log(string);
      //var json =  JSON.parse(string);
      res.json(ext);



      //console.log(ext)

 


});
   



 });

 router.get('/usuarios', (req, res) => {
   db.query('SELECT * FROM planilla', (error, results) => {
      if (error) throw error;
      res.json(results);

   });

});



module.exports = router;