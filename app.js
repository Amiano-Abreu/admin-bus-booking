var express=require("express"),
	app=express(),
	bodyParser=require("body-parser"),
	passport=require("passport"),
	localStratergy=require("passport-local"),
	passportLocalMongoose=require("passport-local-mongoose"),
    firebase = require('firebase'),
	
	methodOverride= require('method-override'),
	mongoose=require('mongoose'),
	auth=require("./models/auth.js");

	alert = require("alert");
	
	var appIni = firebase.initializeApp(
{
	apiKey: "AIzaSyD0ZsD_6babl4bVzVR64WMWTkk6Z682pnI",
    authDomain: "dent-a9be0.firebaseapp.com",
    databaseURL: "https://dent-a9be0-default-rtdb.firebaseio.com",
    projectId: "dent-a9be0",
    storageBucket: "dent-a9be0.appspot.com",
    messagingSenderId: "792987593473",
    appId: "1:792987593473:web:ded996305041877a624900"
});	

var db = firebase.database();
	
	

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use("/assets",express.static("assets"));
app.use(methodOverride("_method"));

app.use(require("express-session")(
{
	secret:"abcd",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(auth.authenticate()));

passport.serializeUser(auth.serializeUser());
passport.deserializeUser(auth.deserializeUser());
app.use(function(req,res,next)
{
	res.locals.current=req.user;
	next();
});

mongoose.connect("mongodb://localhost/_auth",{useUnifiedTopology:true,useNewUrlParser:true});



/*----------------------------------------------------------Routes---------------------------------------------------------------------*/

app.get("/",function(req,res)
{
	res.render("home");
	
});


app.get("/customer",isLoggedIn,function(req,res)
{
	db.ref('users').once("value",function(snap)
	{   var y = snap.val();
	    var x=[];
	   if(snap.val())
		{
		console.log(snap.val());
		var x = Object.keys(snap.val());
		console.log(x[0]);
		console.log(y);
		
		res.render("customer",{key:x,value:y});
		}
		else
		{
			res.render("customer",{key:x,value:snap.val()});
		}
	});
	
	
	
	
	/*cust.find({},function(err,result)
		{
			if(err)
			{
				console.log(err);
			}
			else
			{
	            res.render("customer",{r:result});			
			}
		});
	*/
});

app.get("/customer/new",isLoggedIn,function(req,res)
{
	res.render("new");
});

app.post("/customer",function(req,res)
{var c = req.body.c;
var x=[];
	db.ref("users").once("value",function(snap)
	{   if(snap.val())
		{
			x =Object.keys(snap.val());
		}
		if(x.indexOf(req.body.rid)==-1)
		{   
	         c.balance=parseInt(c.balance);
	         c.m_no=parseInt(c.m_no);
			 c.email = c.email.replace(/[@.]/g,function(m){
			return {"@":"_",".":"_"}[m];
			});
		    db.ref('users').child(req.body.rid).set(c);
			console.log(req.body.rid);
			var y={[req.body.c.email] :req.body.rid};
			db.ref('email_rfid_map').set(y);
		    res.redirect("/customer");		
		}
		else
		{
			alert("Rfid already exists");
			res.redirect("/customer/new");
		}
		
	
		
		
	});
	
});

app.get("/customer/:id/edit",isLoggedIn,function(req,res)
{   console.log(req.params.id);
db.ref("users").child(req.params.id).once('value',function(snap)
{ 
res.render("update",{r:snap.val(),id:req.params.id});
});
});

app.put("/customer/:id",isLoggedIn,function(req,res)
{
	db.ref('users').child(req.body.rid).update(req.body.c);
	var x={[req.body.c.email] :req.body.rid};
	db.ref('email_rfid_map').set(x);
	res.redirect("/customer");
	
});

app.post("/customer/name",isLoggedIn,function(req,res)
{if(req.body.n)
	{	
console.log(req.body.n);
    db.ref('users').orderByChild("name").equalTo(req.body.n).once('value',function(snapshot)
	{if(snapshot.val())
		{		
	var x = Object.keys(snapshot.val());
	  res.render("customer",{key:x,value:snapshot.val()});
		}
		else
		{
			res.redirect("/customer");
		}
	});
	}
	else
	{
		res.redirect("/customer");
	}
	
});

app.get("/customer/:id/delete",function(req,res)
{   db.ref("users").child(req.params.id).once('value',function(snap)
	{   if(snap.val())
		{ db.ref("email_rfid_map").child(snap.val().email).remove();
		}
	  	
		db.ref("users").child(req.params.id).remove();
			res.redirect("/customer");
	});

});
/*************************************************************************Fare Chart********************************************************************/
app.get("/fare",isLoggedIn,function(req,res)
{db.ref("stops").once("value",function(snap)
	{var x =[];
		if(snap.val())
		{
		var x =Object.keys(snap.val());
		res.render("fare_chart",{key:x,value:snap.val()});
	    }
		else
		{
			res.render("fare_chart",{key:x,value:snap.val()});
		}
	});
	
	
	
});


app.get("/fare/new",isLoggedIn,function(req,res)
{var x = [];
	db.ref("stops").once("value",function(snap)
	{   if(snap.val())
		{
		var x =Object.keys(snap.val());
		console.log(parseInt(x.slice(-1))+1);
		res.render("fare_new",{key:parseInt(x.slice(-1))+1});
		}
		
		else
		{
			res.render("fare_new",{key:1});
		}
	});
	
});


app.post("/fare",function(req,res)
{
	var c =req.body.c;
	c.lat=parseFloat(c.lat);
	c.long = parseFloat(c.long);
	db.ref("stops").child(req.body.num).set(c);
    res.redirect("/fare");

}); 


app.get("/fare/:id",isLoggedIn,function(req,res)
{
	db.ref("stops").child(req.params.id).once('value',function(snap)
	{
		console.log(req.params.id);
		res.render("fare_update",{r:snap.val(),key:req.params.id});
	});
});

app.put("/fare/:id",function(req,res)
{
	db.ref('stops').child(parseInt(req.body.num)).update(req.body.c);
	res.redirect("/fare");
	
});

app.post("/fare/search",function(req,res)
{
	if(req.body.n)
	{	
console.log(req.body.n);
  db.ref('stops').orderByChild("name").equalTo(req.body.n).once('value',function(snapshot)
	{if(snapshot.val())
        {		
	var x = Object.keys(snapshot.val());
	  res.render("fare_chart",{key:x,value:snapshot.val()});
		}
		else
		{res.redirect("/fare");
		}
    });
	}
	else
	{
		res.redirect("/fare");
	}
	
});

app.get("/fare/:id/delete",function(req,res)
{
	
	db.ref("stops").child(req.params.id).remove();
	res.redirect("/fare");
});

/*--------------------------------------------------------------------- Buses-----------------------------------------------------------------------------*/

app.get("/bus",isLoggedIn,function(req,res)
{
	db.ref("buses").once("value",function(snapshot)
	{  if(snapshot.val())
		{
		var x = Object.keys(snapshot.val());
		var y =snapshot.val();
		var station=[];
		db.ref("stops").once("value",function(snap)
		{
			var k = Object.keys(snap.val());
			var z = snap.val();
			console.log(x);
			console.log(y);
			console.log(k);
			console.log(z);
			
			x.forEach(function(x)
			{   var m =[];
				var arr=y[x];
				arr.shift();
				console.log(arr);
				arr.forEach(function(arr)
				{
					m.push(z[arr].name);
					
				});
				station.push(m);
				console.log(station);
			});
			
			console.log(station);
			res.render("bus",{busno:x,station:station});
		});
		}
		else
		{
			res.render("bus",{busno:[],station:[]});
		}
		
		
	});	
});




app.get("/bus/new",isLoggedIn,function(req,res)
{
	res.render("new_bus");
});

app.post("/bus/imd",function(req,res)
{
	var x=req.body.s;
	db.ref("buses").once("value",function(snap)
	{
		if(snap.val())
		{
	
		var count=0;
		var y = Object.keys(snap.val());
		console.log(y);
		console.log(req.body.bno);
		y.forEach(function(y)
		{
			if(y==req.body.bno)
			{console.log("it exists");
				count=1;
			}
		});
		if(count==1)
		{alert("This bus no already exist!!!!");
	     res.redirect("/bus/new");
	
		}
		else
		{
			console.log(x);
	       res.render("fare_new_real",{r:x,l:req.body.bno});
		}
		}
		else
	{
		res.render("fare_new_real",{r:x,l:req.body.bno});
	}
	});
	
	
	
	
	
});

app.post("/bus",function(req,res)
{ 
	var l =req.body.s;
	console.log(l[0]);
	console.log("check");
	var x,y;
	var count=1,c=0;
    var a=[];
	 db.ref("stops").once("value",function(snap)
	 {
		x=Object.keys(snap.val());
        y=snap.val();	
        console.log(x);		
			console.log(y);
			for(var i=0;i<l.length;i++)
			{ c=0;
				console.log(l[i]);
				for(var j=0;j<x.length;j++)
				{
					if(l[i] == y[x[j]].name)
					{
						var p = {[count]:parseInt(x[j])};
						a.push(p);
						count=count+1;
						c=1;
					}
					
				}
				if(c==0)
				{ break;
				}
				
				
			}
		console.log(a);
		 if(c==1)
		 {
         a.forEach(function(a)
		{	
			db.ref("buses").child(req.body.bno).update(a);		 
		});	
		res.redirect("/bus");
		 }
		 else
		 {
			 alert("Entered Station Is Invalid!!!!!!");
			 res.redirect("/bus/new");
		 }
	 }); 
});


app.get("/bus/:id/edit",isLoggedIn,function(req,res)
{var station=[];
	 db.ref("buses").child(req.params.id).once("value",function(result)
	 {
		 var x = result.val();
		 x.shift();
		 db.ref("stops").once("value",function(snap)
		 {
			 var y = Object.keys(snap.val());
			 x.forEach(function(x)
			 {
				 y.forEach(function(y)
				 {
					 if(x == y)
					 {
						 station.push(snap.val()[x].name);
					 }
					 
				 });
			 });
				
			console.log(station);
			res.render("bus_update",{r:req.params.id,st:station});
			
			 
		 });
		 
	 });
});

app.put("/bus/:id",function(req,res)
{
	var l =req.body.s;
	console.log(l[0]);
	console.log("check");
	var x,y;
	var count=1,c=0;
    var a=[];
	 db.ref("stops").once("value",function(snap)
	 {
		x=Object.keys(snap.val());
        y=snap.val();	
        console.log(x);		
			console.log(y);
			for(var i=0;i<l.length;i++)
			{ c=0;
				console.log(l[i]);
				for(var j=0;j<x.length;j++)
				{
					if(l[i] == y[x[j]].name)
					{
						var p = {[count]:parseInt(x[j])};
						a.push(p);
						count=count+1;
						c=1;
					}
					
				}
				if(c==0)
				{ break;
				}
				
				
			}
		console.log(a);
		 if(c==1)
		 {
         a.forEach(function(a)
		{	
			db.ref("buses").child(req.body.bno).update(a);		 
		});	
		res.redirect("/bus");
		 }
		 else
		 {
			 alert("Entered Station Is Invalid!!!!!!");
			 res.redirect("/bus/new");
		 }
	 }); 
});

app.post("/bus/search",function(req,res)
{  if(req.body.n)
	{
	db.ref("buses").child(req.body.n).once("value",function(snapshot)
	{  if(snapshot.val())
		{
		
		var y =snapshot.val();
		
		
		db.ref("stops").once("value",function(snap)
		{
			var k = Object.keys(snap.val());
			var z = snap.val();
			var m =[];
		    y.shift();
			
				y.forEach(function(y)
				{
					m.push(z[y].name);
					
				});
			var arr=[];
             arr.push(req.body.n);
    		var station=[];
            station.push(m);			
			res.render("bus",{busno:arr,station:station});
		});
		}
	});
	}	
		else
		{
			res.redirect("/bus")
		}
		
});

	


/********************************************************************Authentication********************************************************************/


app.get("/signup",function(req,res)
{
	res.render("Signup");
});

app.post("/signup",function(req,res)
{
	console.log(req.body);
	auth.register(new auth({username:req.body.username}),req.body.password,function(err,result)
		{
			if(err)
			{
				alert("User already registered");
				return res.redirect("/signup");
				
				
				
			}
			passport.authenticate("local")(req,res,function()
			{
				res.redirect("/");
			});
		})
});


app.get("/login",function(req,res)
{
	res.render("login");
});

app.post("/login",passport.authenticate("local",
{
	successRedirect:"/",
	failureRedirect:"/login"

}),function(req,res)
{
});

app.get("/logout",function(req,res)
{
	req.logout();
	res.redirect("/login");
});

function isLoggedIn(req,res,next)
{
	if(req.isAuthenticated())
		
	{
		return next();
	}
	else
	{
		res.redirect("/login");
	}
	
}












app.listen("3000","localhost",function()
{
	console.log("Listening at port 3000");                                                                                                                                                                                                                                  
});