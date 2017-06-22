 // extractJwtKidForAuth0.js
// ------------------------------------------------------------------

var jwt = context.getVariable(properties.jwtvar);

if (jwt && jwt.length > 0) {
  try {
    jwt = jwtDecode(jwt);
    print(JSON.stringify(jwt));
    // set the certificate for the particular Key-id into a context variable
    var cert = JSON.parse(context.getVariable('auth0cert.' + jwt.header.kid));
    print(JSON.stringify(cert));
    context.setVariable('auth0_modulus', JSON.stringify(cert.n));
    context.setVariable('auth0_exponent', JSON.stringify(cert.e));
    context.setVariable('auth0_certificate', JSON.stringify(cert.x5c[0]));
  }
  catch (exc1) {
    context.setVariable('auth0_certificate', null);
  }
}