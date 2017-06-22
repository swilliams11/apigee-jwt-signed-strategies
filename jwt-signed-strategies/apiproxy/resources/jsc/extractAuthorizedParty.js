var jwtClaims = JSON.parse(context.getVariable("jwt_claims"));
try{
    //var azp = JSON.stringify(jwtClaims.azp);
    var azp = jwtClaims.azp;
    context.setVariable("jwt_azp", azp);
    
} catch(exc1){
    context.setVariable("jwt_azpExists", "false");
}