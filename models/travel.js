var mongoose = require("mongoose");
var Customer = require("././customer.js");
var Route = require("././fare_chart.js");

var travelSchema=new mongoose.Schema(
{
	arrival_time:String,
	departure_time:String,
	customers:[
				{
					type:mongoose.Schema.Types.ObjectId,
							ref:Customer
				}],
	route:[
				{
					type:mongoose.Schema.Types.ObjectId,
					ref:Route
				}
				]			
	
	
});


module.exports=mongoose.model("travel",travelSchema);