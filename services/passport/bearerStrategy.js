var shortid = require('shortid');
const passport = require('passport');
const User = require('../../models').users;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var GoogleTokenStrategy = require("passport-google-verify-token").Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var GoogleTokenStrategy = require("passport-google-verify-token").Strategy;


module.exports = () => {
  
    passport.use(new GoogleTokenStrategy({
        clientID: '12345.abcdefghijkl.apps.googleusercontent.com'// Specify the CLIENT_ID of the backend
      },
      function(parsedToken, googleId, done) {
        findOne({where: {email}})
     .then((user) => {
      if (!user) {
       return done(null, false)
      }
      })
    }
    ));
}
    // passport.use(new GoogleTokenStrategy({
    //     clientID: process.env.GOOGLE_CLIENT_ID,
    //     clientSecret: process.env.GOOGLE_SECRET_ID,
    //     callbackURL: "http://eyecare.idynamics.co.kr:4000/auth/google/callback",
    //     passReqToCallback: true,
    //  },
    //   async(parsedToken, googleId, done)=> {
    //     try {
    //         // console.log(accessToken);

    //         console.log(accessToken);
    //         const email = profile.emails[0].value
    //         uuid = shortid.generate();
    //         const updatedAt = new Date(Date.now());
    //         const exUser = await User.findOne({
    //             where: { email }
    //         });

    //         if (exUser) {
    //             const provider = exUser.provider;
    //             if (exUser.provider === 'local') {
    //                 await User.update({
    //                     provider: 'local_social',
    //                     updatedAt: updatedAt,
    //                     user_id: uuid
    //                 }, { where: { email } }, (err, result) => {
    //                     if (err) throw (err);
    //                 })
    //             }

    //             else if (exUser.provider === 'google') {
    //                 return done(null, exUser);

    //             }

    //             return done(null, exUser);
    //         } else {
    //             const newUser = await User.create({
    //                 user_id: uuid,
    //                 email: profile.emails[0].value,
    //                 provider: 'google',
    //                 created_date: updatedAt
    //             });

    //             await newUser.save();
    //             return done(null, newUser);
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         return done(error);
    //     }
    //   }
    // ));

// passport.use(new GoogleTokenStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_SECRET_ID,
//     callbackURL: "http://eyecare.idynamics.co.kr:4000/auth/google/callback",
//     passReqToCallback: true,
// },
//    async function(parsedToken, googleId, done) {
//         try {
//             console.log(accessToken);
//             const email = profile.emails[0].value
//             uuid = shortid.generate();
//             const updatedAt = new Date(Date.now());
//             const exUser = await User.findOne({
//                 where: { email }
//             });

//             if (exUser) {
//                 const provider = exUser.provider;
//                 if (exUser.provider === 'local') {
//                     await User.update({
//                         provider: 'local_social',
//                         updatedAt: updatedAt,
//                         user_id: uuid
//                     }, { where: { email } }, (err, result) => {
//                         if (err) throw (err);
//                     })
//                 }

//                 else if (exUser.provider === 'google') {
//                     return done(null, exUser);

//                 }

//                 return done(null, exUser);
//             } else {
//                 const newUser = await User.create({
//                     user_id: uuid,
//                     email: profile.emails[0].value,
//                     provider: 'google',
//                     created_date: updatedAt
//                 });

//                 await newUser.save();
//                 return done(null, newUser);
//             }
//         } catch (error) {
//             console.error(error);
//             return done(error);
//         }
//     }));
// }
// passport.use("accessToken", new BearerStrategy((accessToken, done) => {
//     db.AccessToken.findOne({where: {token: accessToken}})
//     .then((token) => {
//      if (!token) {
//       return done(null, false)
//      }
//      if (new Date() > token.expiration_date) {
//       return token.destroy()
//       .then(() => done(null, false))
//      }
   
//      return db.User.findOne({where: {id: token.userId}})
//      .then((user) => {
//       if (!user) {
//        return done(null, false)
//       }
//       const info = { scope: JSON.parse(token.scope) }
//       done(null, user, info);
//      })
//     })
//     .catch(err => done(new Error('Internal Server Error')))
//    }))