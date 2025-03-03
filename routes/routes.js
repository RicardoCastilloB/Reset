const express = require('express');
const router = express.Router();
const path = require("path");
const folderPath = (path.join(__dirname,'../public'));
const fileUpload = require('../services/upload/lib/index');
const fs = require('node:fs');
const fetch = (url, init) => import('node-fetch').then(module => module.default(url, init));
router.use(fileUpload());
const { FormData } = require('node-fetch');
const db = require('../config/db/db');




router.get('/autocompletar', function(req, res, next) {
res.render('autocompletar', { title: 'Express' });
  });




  router.get('/lay', function(req, res, next) {
    res.render('reports', { title: 'Express' });
  });


  router.get('/tmp2', function(req, res, next) {
    res.render('tmp2', { title: 'Express' });
  });


  router.get('/hi', function(req, res, next) {
    res.render('hi', { title: 'Express' });
  });

router.get('/tt',function(req,res) {
    console.log('single file');
    
    // Download function provided by express
    res.download(folderPath+'/users.json', function(err) {
        if(err) {
            console.log(err);
        }
    })
  })

router.get('/tt2', (req, res) => {
  
  
    console.log('single file');
    
    // Download function provided by express
    res.download(folderPath+'/PC.json', function(err) {
        if(err) {
            console.log(err);
        }
    })
  
    console.log("ok");
  
  
  
  })


  router.get('/up', (req, res) => {
  
  
    res.render('upload', { title: 'AutoCompletar' });
  
  
  
  })


  router.post('/upload', function(req, res) {
    let sampleFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send('No files were uploaded.');
      return;
    }
  
    console.log('req.files >>>', req.files); // eslint-disable-line
  
    sampleFile = req.files.sampleFile;
   //res.sendFile(path.join(__dirname,'../uploads/'));

    uploadPath = (__dirname,'./uploads/') + sampleFile.name;
  
    sampleFile.mv(uploadPath, function(err) {
      if (err) {
        return res.status(500).send(err);
      }




  
      res.send('File uploaded to ' + uploadPath);





    });
  });




module.exports = router;