const { expect } = require("chai");

const token = "bee47dc252fdb871aa7b3899e4cd9dff1ab2607891298226c0a69eedfeb5a651";

const headers={
    'Authorization': `Bearer ${token}`
}
// fetch is natively supported by Node to make HttpRequests
// https://developer.mozilla.org/en-US/docs/Web/API/fetch
// https://javascript.info/fetch for examples
describe('User API ', ()=>{
    const usersApi = 'https://gorest.co.in/public/v2/users';

    
    // NOTE: GET does not require any headers for this API.

    it('GET can get user list without header', async ()=>{
        await fetch('https://gorest.co.in/public/v2/users').then(async response => {
            console.log(response.status),
            expect(response.status).to.be.equal(200);
            var responseJson = await response.json()          
            console.log('response body is ', JSON.stringify(responseJson))
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
})