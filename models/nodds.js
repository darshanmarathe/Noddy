 function OneBigFunction(count , callback) {
		var  i  = 0;

         var counter =     setInterval(function() {
             	if (i == coun) {

             		clearInterval(counter);
             		callback();
             		return;
             	};

             	i++;
             	console.log(i.toString());
             }, 100)

            }


OneBigFunction(1000 , function() {
	console.log('done');
});

