const { v4: uuidv4 } = require('uuid');

const { expect } = require("chai");
const exp = require('constants');

const token = "bee47dc252fdb871aa7b3899e4cd9dff1ab2607891298226c0a69eedfeb5a651";

const usersApi = 'https://gorest.co.in/public/v2/users';

/** Include the Bearer Token for these headers */
var authenticatedHeaders =
{
   "Authorization": `Bearer ${token}`,
   "Accept":"application/json", 
   "Content-Type":"application/json"
}

/** Create a new user Object */
function createNewUser(){
     // Create new user
     const userEmailGuid = uuidv4();
     const testUser = {
         'name':'TestUser', 
         'gender':'male', 
         'email':`bg+${userEmailGuid}@cd.com`, 
         'status':'active'
     }
    return testUser;
}

/** Add user to website via api */
async function addUser(user){
    await fetch(`${usersApi}`, {headers: authenticatedHeaders, method: 'POST', body: JSON.stringify(user)})
    .then(async response => {
        await response.json()               
        expect(response.status).to.be.equal(201);              
    })
}

// use javascript Object filter. example: 
// https://stackoverflow.com/questions/61229242/how-to-filter-json-object-javascript
async function getUserIdByEmail(email){
    var userId= 0;
    await fetch('https://gorest.co.in/public/v2/users', {headers: authenticatedHeaders, method: 'GET'}).then(async response => {
       
        expect(response.status).to.be.equal(200);
        var responseJson = await response.json()          
        const items = responseJson;
        expect(responseJson[0].id, 'Could not find any user IDs').to.exist;  //return at least one user

        const userResult = items.filter(c => c.email === email)  //with plain  = you are setting that email. :(
        console.log("filtered results", userResult)

        console.log("looking for user with email ", email)
        console.log('user result is ', userResult[0].id)
        userId = userResult[0].id
    })
    return userId;
}

// fetch is natively supported by Node to make HttpRequests
// https://developer.mozilla.org/en-US/docs/Web/API/fetch
// https://javascript.info/fetch for examples
describe('User API ', ()=>{
    
    // NOTE: GET does not require any headers for this API.
    // If you want to return users created by YOUR token, you will need to provide it.
    // Otherwise GET returns a generic set.

    it('GET can get user list without header', async ()=>{
        await fetch('https://gorest.co.in/public/v2/users').then(async response => {
            expect(response.status).to.be.equal(200);
            var responseJson = await response.json()          
            expect(responseJson[0].id).to.exist;  //return at least one user
        })
    })
    
    it('Create User, missing header with POST, returns 401', async () => {
        await fetch(usersApi, {method: 'POST'}).then(response => {
            expect(response.status).to.be.equal(401)
        })
    })

    // PAGE NOT FOUND
    it('Create User, page not found for method PUT, returns 404', async () => {
        await fetch(usersApi, {method: 'PUT'}).then(response => {
            expect(response.status).to.be.equal(404)
        })
    })

    it('Create User, page not found for method DELETE, returns 404', async () => {
        await fetch(usersApi, {method: 'DELETE'}).then(response => {
            expect(response.status).to.be.equal(404)
        })
    })


    // Create new user
    const userEmailGuid = uuidv4();
    const testUser = {
        'name':'TestUser', 
        'gender':'male', 
        'email':`bg+${userEmailGuid}@cd.com`, 
        'status':'active'
    }

    it('Create User, creates a user with POST, returns 201', async () => {
        await fetch(usersApi, {headers: authenticatedHeaders, method: 'POST', body: JSON.stringify(testUser)}).then(async response => {
            var responseJson = await response.json()               
            expect(response.status).to.be.equal(201);              
        })
    })

    it('Create user, POST fails to create user with no email, returns 422', async () => {
        const testUserMissingEmail = {
            'name':'TestUser', 
            'gender':'male', 
            'email':'', 
            'status':'active'
        }

        await fetch(usersApi, {headers: authenticatedHeaders, method: 'POST', body: JSON.stringify(testUserMissingEmail)})
            .then(async response => {
                var responseJson = await response.json();
                expect(responseJson[0]).to.have.property('message')
                expect(responseJson[0].message).contains("can't be blank")
                expect(responseJson[0]).to.have.property('field')
                expect(responseJson[0].field).contains('email')
                expect(response.status).to.be.equal(422)
        })
    })

    it('can DELETE user, returns 204 - no content', async () => {
        // arrange

        var testUserDelete = createNewUser()
        var userIdToDelete = "0";
        await fetch(usersApi, {headers: authenticatedHeaders, method: 'POST', body: JSON.stringify(testUserDelete)})
        .then(async response => {
            var responseJson = await response.json()               
            expect(response.status).to.be.equal(201);              
        })
        userIdToDelete = await getUserIdByEmail(testUserDelete.email);
        console.log('user id to delete, filtered', userIdToDelete)
        
        // act
        await fetch(`${usersApi}/${userIdToDelete}`, {headers: authenticatedHeaders, method: 'DELETE'})
        .then(async (response) =>{
            // assert
            expect(response.status).to.equal(204)
        })
    }).timeout(10000)  // test takes longer than mocha default 2 seconds

    it('tries to DELETE user by non existent id, returns 404', async () => {
        var userIdToDelete  = '0000'
        await fetch(`${usersApi}/${userIdToDelete}`, {headers: authenticatedHeaders, method: 'DELETE'}).then(async (response) =>{
            expect(response.status).to.equal(404)
        })
    })

    it('can GET user, by ID, returns 200 and user object', async () => {
        // arrange
        var newUser = createNewUser();
        await addUser(newUser);
        var userId = await getUserIdByEmail(newUser.email)

        //act
        await fetch(`${usersApi}/${userId}`, {headers: authenticatedHeaders}).then(async (response) => {
            var respJson = await response.json();
            expect(response.status).to.equal(200);

            // assert
            expect(respJson.email).to.equal(newUser.email)
        })
    }).timeout(10000);

    it('can PATCH update user, returns 200 and user updated object', async() => {
         // arrange
         var newUser = createNewUser();
         await addUser(newUser);
         var userId = await getUserIdByEmail(newUser.email)

        // update email
        newUser.email=`bg+patch${uuidv4()}@test.com`;
        console.log('updating email to ', newUser.email)

         //act
        await fetch(`${usersApi}/${userId}`, {headers: authenticatedHeaders, method: 'PATCH', body: JSON.stringify(newUser)})
        .then(async (response) => {
            var respJson = await response.json();
            expect(response.status).to.equal(200);

            // assert
            expect(respJson.email).to.equal(newUser.email)
            expect(respJson.id).to.equal(userId);
        })
    })

    it('can PUT update user, returns 200 and user updated object', async() => {
        // arrange
        var newUser = createNewUser();
        await addUser(newUser);
        var userId = await getUserIdByEmail(newUser.email)

       // update email
       newUser.email=`bg+put${uuidv4()}@test.com`;
       console.log('updating email to ', newUser.email)

        //act
       await fetch(`${usersApi}/${userId}`, {headers: authenticatedHeaders, method: 'PUT', body: JSON.stringify(newUser)})
       .then(async (response) => {
           var respJson = await response.json();
           console.log('response for PUT is ', respJson)
           expect(response.status).to.equal(200);

           // assert
           expect(respJson.email).to.equal(newUser.email)
       })
   })
})