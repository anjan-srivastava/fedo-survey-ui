import React from 'react';

class UserApi {
 static me() {
       return fetch('/api/users/me', {
           method: 'GET',
           credentials: 'same-origin',
           headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json'
           }
       }).then((res) => res.json());
   }   
}

export default UserApi;

