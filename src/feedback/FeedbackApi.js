import React from 'react';

class FeedbackApi {

   static list (query, page) {
        return fetch('/api/feedbacks/?page=' + page, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(query)
        }).then((res) => res.json());
   }
   
   static tags (q) {
        q = q?q:"";
        return fetch('/api/feedbacks/tags?q='+q, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        }).then((res) => res.json());
   }


   static publish (fkey) {
        return fetch('/api/feedbacks/'+fkey+'/publish', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => res.json());     
   }
   
   static unpublish (fkey) {
        return fetch('/api/feedbacks/'+fkey+'/unpublish', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => res.json());     
   }

   static updateReviewerName (fkey, name) {
       return fetch('/api/feedbacks/'+fkey+'/edit', {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name: name })
        }).then((res) => res.json());     
   }
}

export default FeedbackApi;
