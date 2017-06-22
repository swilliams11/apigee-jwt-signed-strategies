 // extractAuth0Certs.js
// ------------------------------------------------------------------

var r = JSON.parse(context.getVariable('auth0Certs.content'));

// set context variables containing each PEM strings for each auth0 certificate
for(i = 0; i < r.keys.length; i++){
    print(r.keys[i]);
    context.setVariable('auth0cert.' + r.keys[i].kid, JSON.stringify(r.keys[i]));
}
