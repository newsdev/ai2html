/////////////////////////////////////////////////////////////////
// The Document Object Model Explorer v.2 -- CS 
//>=--------------------------------------
//
// Select an object on the page, then run this script. 
// It will return a list of everything that object contains.
// You can also manually explore the document object model by entering an object's path.
// 
// As of version 2, a "displayErrors" variable has been added. 
// Now users can view objects that failed.  
// "displayErrors" defaults to true, but can be turned off by 
// setting it to "0" in the first line of the script.
//
// Output is also now alphabetized, and is broken into multiple alerts if output is
// longer than the "maxLines" variable.
// 
// Prompt can now be used as a javascript command line too.
// If user input returns a value, the value is returned in an alert box.
//>=--------------------------------------
// JS code (c) copyright: John Wundes ( john@wundes.com ) www.wundes.com
//copyright full text here:  http://www.wundes.com/js4ai/copyright.txt
////////////////////////////////////////////////////////////////// 
 

var displayErrors = 1;
var maxLines = 40;
var bob = "";
var disp_ar = new Array();
//the item count object:
var c = 0;
var	observed  = prompt("What do you want to explore? i.e.;\r   app (not used before CS)\r   documents\r   activeDocument.pageItems[0]","activeDocument.selection[0]");
// var	observed  = prompt("What do you want to explore? i.e.;\r   app (not used before CS)\r   documents\r   activeDocument.pageItems[0]","activeDocument.selection[0].paragraphs[0].characters[0].textFont.name");
// var	observed  = prompt("What do you want to explore? i.e.;\r   app (not used before CS)\r   documents\r   activeDocument.pageItems[0]","activeDocument.selection[0].paragraphs[0].characters[0].fillColor");



//assign prompt text to actual object;
//   a side effect of which is, 
//	 if the user input is actually a line of executable code,
//   it gets run here:
var thisObject = eval(observed);
try
{

	for (all in thisObject )
		{
		c++;
			//attempt to decypher each sub object
		try
			{
				bob= all+"=";
				bob+=  eval(observed+"."+all);
				disp_ar.push(bob);
				
			}
		catch (e)
			{
			// if undecypherable, say why:
			if(displayErrors){
				bob = all+"="+(e.toString().split(":"))[1];
				disp_ar.push(bob);
			}
		}
			
			disp_ar.sort();
	}
	//decide arbitrary max length of list before switching to tabs.

	
	if(c>1){
		// if object has more than one object content:
		var nicedisp = "";
		var dispLen = disp_ar.length;
		// if longer than max, divide by the amount longer than max, so you don't
		// end up with a dangling variable at the end.
		var maxNum = dispLen>maxLines?dispLen/Math.ceil(dispLen/maxLines):maxLines;
		var dispOutput = new Array("");
		var more = "";
		var myLoc = 0;
		for (var x=0;x<dispLen;x++)
		{
			// add spacing for formatting of line numbers less that 10.
			if(x<9 ){
				spc = "  ";
			} else{
				spc = "";
			}
			var thisMod = Math.ceil(x%maxNum);
			if(thisMod==true && x>maxNum -1){
				myLoc++;
				//initialize array slot:
				dispOutput[myLoc] = "";
			}
			
			dispOutput[myLoc]+=(spc+(x+1)+") "+disp_ar[x]+"\r");	 
		}
		//show output page(s):
		var outLen = dispOutput.length;
		for (var a=0;a<outLen;a++)
		{ 
			more = a<(outLen-1)?"   More...":"";
			alert("Contents of:\r"+observed+"\r------------------------\r"+dispOutput[a]+more);
		}
	
		 
	}else{
		alert("Value of:\r"+observed+"\r------------------------\r"+thisObject );
	}
		
	}
catch (e)
{
	//if user is running code from command line, do nothing.
	//if object returns something, show it:
	if(thisObject!= undefined){
		alert(thisObject);
	}
}
//handle spacing for columns
function makeSpace(num){
	spc = "";
	for (var j=0;j<num ;j++ )
	{
	 spc+="|";
	}
	return spc;
}
