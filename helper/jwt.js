var { expressjwt} = require("express-jwt");

function  authJwt   () {
const secret= process.env.secret
const api = process.env.API_URL;
    return  expressjwt({
        secret,
        algorithms: ["HS256"],
   //     isRevoked: isRevoked

    }).unless({
        path:[
            {
            //    url:         '/api/v1/users/products',
            url:/\/api\/v1\/products(.*)/,
                method:['GET','OPTIONS']
            },
            '/api/v1/users/login',
            '/api/v1/users/register'
            
        ]
    })

}
// async function isRevoked(req, payload, done) {
//     if(!payload.isAdmin) {
//      await   done(null, true)
//     }

//     done();
// }
module.exports=authJwt;