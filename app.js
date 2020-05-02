/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

require('dotenv').config({
  silent: true
});
//const express = require('express')

const express = require('express');
const router = express.Router(); // app server
const bodyParser = require('body-parser'); // parser for post requests
const numeral = require('numeral');
const fs = require('fs'); // file system for loading JSON
var expressFileUpload=require('express-fileupload');
const app = express();
app.use(expressFileUpload());
var multer  = require('multer');
var uploadStorage = multer.memoryStorage();
var upload = multer({storage: uploadStorage});
var fileInputToggle=false;
var localStorage = require('localStorage');
var sessionstorage = require('sessionstorage');
// Bootstrap application settings
var Cloudant = require('@cloudant/cloudant');
const path=require('path');
app.set('view engine','ejs');

app.set('views',path.join(__dirname,'./views'));
app.use(express.static('./public/pages')); // load UI from public folder
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setupError will be set to an error message if we cannot recover from service setup or init error.
let setupError = '';


app.post('/adminlogin',function(req,res){
	
	//console.log("Login called for sigin");
	if(req.body){
		//return res.json(req.body);
		console.log("Input exists"+req.body.username+" "+req.body.pass);
		var cloudant = Cloudant("https://d639a1a8-b6fe-4622-a248-b07278e37dc4-bluemix:a46931d00418ae4a7c06e1ec898c80a3575e5a264b40fa88f9ae03bcf89b504c@d639a1a8-b6fe-4622-a248-b07278e37dc4-bluemix.cloudant.com",function(err,cloudant){
		if(err){
			console.log('Failed to initialize');
		}
		else{
			var db=cloudant.db.use('admin-theme-user');
			db.find({selector:{username:req.body.username}},function(err,data){
				console.log("following data"+JSON.stringify(data));
				if(data.docs.length>0){
				if(data.docs[0]._id){
					res.redirect('/admin_login.html?session='+req.body.username+'');
					
				}
				else if(err){
					console.log('User Not Found');
				}
				else{
					res.send("Wrong Creds");
				}
				}
				else{
					res.send("Wrong Creds");
				}
			});
		}
		});
	}
	
});

app.post('/login',function(req,res){
	
	//console.log("Login called for sigin");
	if(req.body){
		var cloudant = Cloudant("https://d639a1a8-b6fe-4622-a248-b07278e37dc4-bluemix:a46931d00418ae4a7c06e1ec898c80a3575e5a264b40fa88f9ae03bcf89b504c@d639a1a8-b6fe-4622-a248-b07278e37dc4-bluemix.cloudant.com",function(err,data){
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var db=cloudant.db.use("customized-ui-access");
				var dbURL='https://d639a1a8-b6fe-4622-a248-b07278e37dc4-bluemix.cloudant.com/customized-ui-access/';
				db.find({ selector: { accessibleUser: req.body.username }}, function(err, data) {
					console.log("data from db"+data);
				//console.log("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com/customized-ui-access/"+data.docs[0]._id+"/themeFile");
				
					if(data.docs.length!=0){
						//console.log("Entered into if");
						var imagesrc=dbURL+data.docs[0]._id+"/themeFile";
						if(data.docs[0].clientTheme=='theme1'){
							res.render('pages/index',{clientName:data.docs[0].clientName,aboutClient:data.docs[0].aboutClient,imgsrc:imagesrc,theme:'./css/app1.css'});
						}
						if(data.docs[0].clientTheme=='theme2'){
							res.render('pages/index',{clientName:data.docs[0].clientName,aboutClient:data.docs[0].aboutClient,imgsrc:imagesrc,theme:'./css/app2.css'});
						}
						if(data.docs[0].clientTheme=='theme3'){
							res.render('pages/index',{clientName:data.docs[0].clientName,aboutClient:data.docs[0].aboutClient,imgsrc:imagesrc,theme:'./css/app3.css'});
						}
						//res.render('pages/index',{clientName:data.docs[0].clientName,aboutClient:data.docs[0].aboutClient,imgsrc:imagesrc,theme:'./css/app2.css'});
					}
					else{
						console.log("Entered into else");
						res.json({failed:"Failed to Fetch"});
					}
    // The rest of your code goes here. For example:
			console.log("Found dog:", data);
			});
				
			}
		});
	}
});
app.get('/',function(req,res){
	var cloudant = Cloudant("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix:10db3f279df241cbd2a9692a6a412f80bf3cadba00bf8324a1cf6f159c00a019@67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com",function(err,data){
			
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var rolesdb=cloudant.db.use("roles");
				var usersdb=cloudant.db.use("users");
				
				//var myVariable="Hello Guys";
				rolesdb.list({include_docs:true},function(err,roledata){
					usersdb.list({include_docs:true},function(err,userdata){
					console.log(JSON.stringify(data.rows));
					//roles=data.rows;
					res.render('pages/index.ejs',{existingRoles:roledata.rows,existingUsers:userdata.rows});
					});
					
				});
				
				
				
			}
			
			
	});
	
			
});
app.post('/editRoles',function(req,res){
	console.log(req.body.roleid);
	var cloudant = Cloudant("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix:10db3f279df241cbd2a9692a6a412f80bf3cadba00bf8324a1cf6f159c00a019@67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com",function(err,data){
			
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var rolesdb=cloudant.db.use("roles");
				var usersdb=cloudant.db.use("users");
				rolesdb.find({selector:{role_id:req.body.roleid}},function(err,data){
					console.log(data);
					var role = {
						'role_id' : req.body.roleid,
						'role' : req.body.role,
						'Description':req.body.desc,
						'_id': data.docs[0]._id,
						'_rev': data.docs[0]._rev
					};
					rolesdb.insert(role,function(err,data){
						rolesdb.list({include_docs:true},function(err,roledata){
						usersdb.list({include_docs:true},function(err,userdata){
							console.log(JSON.stringify(data.rows));
					//roles=data.rows;
							res.render('pages/index.ejs',{existingRoles:roledata.rows,existingUsers:userdata.rows});
						});
					
					});
						
				});
				});
				//var myVariable="Hello Guys";
				
				
				
				
			}
			
			
	});
	
});
app.post('/editUsers',function(req,res){
	console.log(req.body.roleid);
	var cloudant = Cloudant("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix:10db3f279df241cbd2a9692a6a412f80bf3cadba00bf8324a1cf6f159c00a019@67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com",function(err,data){
			
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var rolesdb=cloudant.db.use("roles");
				var usersdb=cloudant.db.use("users");
				usersdb.find({selector:{user_id:req.body.userid}},function(err,data){
					console.log(data);
					var user = {
						'user_id' : req.body.userid,
						'username' : req.body.username,
						'role':req.body.urole,
						'_id': data.docs[0]._id,
						'_rev': data.docs[0]._rev
					};
					usersdb.insert(user,function(err,data){
						rolesdb.list({include_docs:true},function(err,roledata){
						usersdb.list({include_docs:true},function(err,userdata){
							console.log(JSON.stringify(data.rows));
					//roles=data.rows;
							res.render('pages/index.ejs',{existingRoles:roledata.rows,existingUsers:userdata.rows});
						});
					
					});
						
				});
				});
				//var myVariable="Hello Guys";
				
				
				
				
			}
			
			
	});
	
});
app.post('/removeRoles',function(req,res){
	console.log(req.body.roleid);
	var cloudant = Cloudant("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix:10db3f279df241cbd2a9692a6a412f80bf3cadba00bf8324a1cf6f159c00a019@67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com",function(err,data){
			
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var rolesdb=cloudant.db.use("roles");
				var usersdb=cloudant.db.use("users");
				rolesdb.find({selector:{role_id:req.body.rroleid}},function(err,data){
					console.log(data);
					
					rolesdb.destroy(data.docs[0]._id,data.docs[0]._rev,function(err,data){
						rolesdb.list({include_docs:true},function(err,roledata){
						usersdb.list({include_docs:true},function(err,userdata){
							console.log(JSON.stringify(data.rows));
					//roles=data.rows;
							res.render('pages/index.ejs',{existingRoles:roledata.rows,existingUsers:userdata.rows});
						});
					
					});
						
				});
				});
				//var myVariable="Hello Guys";
				
				
				
				
			}
			
			
	});
	
});
app.post('/removeUsers',function(req,res){
	console.log(req.body.roleid);
	var cloudant = Cloudant("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix:10db3f279df241cbd2a9692a6a412f80bf3cadba00bf8324a1cf6f159c00a019@67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com",function(err,data){
			
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var rolesdb=cloudant.db.use("roles");
				var usersdb=cloudant.db.use("users");
				usersdb.find({selector:{user_id:req.body.ruserid}},function(err,data){
					console.log(data);
					
					usersdb.destroy(data.docs[0]._id,data.docs[0]._rev,function(err,data){
						rolesdb.list({include_docs:true},function(err,roledata){
						usersdb.list({include_docs:true},function(err,userdata){
							console.log(JSON.stringify(data.rows));
					//roles=data.rows;
							res.render('pages/index.ejs',{existingRoles:roledata.rows,existingUsers:userdata.rows});
						});
					
					});
						
				});
				});
				//var myVariable="Hello Guys";
				
				
				
				
			}
			
			
	});
	
});
app.post('/addUsers',function(req,res){
	console.log(req.body.roleid);
	var cloudant = Cloudant("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix:10db3f279df241cbd2a9692a6a412f80bf3cadba00bf8324a1cf6f159c00a019@67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com",function(err,data){
			
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var rolesdb=cloudant.db.use("roles");
				var usersdb=cloudant.db.use("users");
				//usersdb.find({selector:{user_id:req.body.userid}},function(err,data){
					//console.log(data);
					var user = {
						'user_id' : req.body.newuserid,
						'username' : req.body.newusername,
						'role':req.body.newurole
					};
					usersdb.insert(user,function(err,data){
						rolesdb.list({include_docs:true},function(err,roledata){
						usersdb.list({include_docs:true},function(err,userdata){
							console.log(JSON.stringify(data.rows));
					//roles=data.rows;
							res.render('pages/index.ejs',{existingRoles:roledata.rows,existingUsers:userdata.rows});
						});
					
					});
						
				});
				//});
				//var myVariable="Hello Guys";
				
				
				
				
			}
			
			
	});
	
});
app.post('/addRoles',function(req,res){
	console.log(req.body.roleid);
	var cloudant = Cloudant("https://67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix:10db3f279df241cbd2a9692a6a412f80bf3cadba00bf8324a1cf6f159c00a019@67d82e47-8f82-4945-9209-bd220b2d7be3-bluemix.cloudant.com",function(err,data){
			
			if(err){
				console.log('Failed to Initialize');
			}
			else{
				
				var rolesdb=cloudant.db.use("roles");
				var usersdb=cloudant.db.use("users");
				//rolesdb.find({selector:{role_id:req.body.roleid}},function(err,data){
					console.log(data);
					var role = {
						'role_id' : req.body.newroleid,
						'role' : req.body.newrole,
						'Description':req.body.newdesc
					};
					rolesdb.insert(role,function(err,data){
						rolesdb.list({include_docs:true},function(err,roledata){
						usersdb.list({include_docs:true},function(err,userdata){
							console.log(JSON.stringify(data.rows));
					//roles=data.rows;
							res.render('pages/index.ejs',{existingRoles:roledata.rows,existingUsers:userdata.rows});
						});
					
					});
						
				});
				//});
				//var myVariable="Hello Guys";
				
				
				
				
			}
			
			
	});
	
});
// Endpoint to be called from the client side

/**
 * Handle setup errors by logging and appending to the global error text.
 * @param {String} reason - The error message for the setup error.
 */
/*router.get('/submitFile',(req,res)=>{
	console.log("Entered here");
});*/

module.exports=router;
function handleSetupError(reason) {
  setupError += ' ' + reason;
  console.error('The app failed to initialize properly. Setup and restart needed.' + setupError);
  // We could allow our chatbot to run. It would just report the above error.
  // Or we can add the following 2 lines to abort on a setup error allowing Bluemix to restart it.
  console.error('\nAborting due to setup error!');
  process.exit(1);
}

module.exports = app;
