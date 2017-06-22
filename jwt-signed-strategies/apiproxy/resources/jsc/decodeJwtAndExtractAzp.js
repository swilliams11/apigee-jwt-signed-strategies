var jwt = context.getVariable(properties.jwtvar);
jwt = jwtDecode(jwt);


try{
    var azp = jwt.payload.azp;
    context.setVariable("jwt_azp", azp);
    
} catch(exc1){
    context.setVariable("jwt_azpExists", "false");
}