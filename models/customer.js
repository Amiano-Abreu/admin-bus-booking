var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var customerSchema=new mongoose.Schema(
{   
	c_name:String,
	email_id:String,
	m_no:Number,
	dob:Date,
	rid:Number,
	balance:Number
	
});

customerSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("cust",customerSchema);