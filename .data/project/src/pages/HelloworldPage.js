var HelloworldPage = (function(){
    //Import modules that will be used
    //
    //var Intent = mobile.content.Intent;
    //var Button = mobile.widgets.Button;

    return mobile.app.Page.extend({
        onCreate: function(context){
            this.base(context);
            this.element = this.getElementById('helloworld-page');

            //TODO write your initial code here
        },
        onStart: function(intent){
            this.base(intent);

            //TODO write your code when page is showing
        }
    });
}());
