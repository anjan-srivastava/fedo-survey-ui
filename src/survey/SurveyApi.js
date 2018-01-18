import React from 'react';

class SurveyApi {
   static list (page) {
        return fetch('/api/surveys/?page=' + page, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then((res) => res.json());
   }

   static getSurvey(surveyKey) {
       return fetch('/api/surveys/' + surveyKey, {
           method: 'GET',
           credentials: 'same-origin',
           headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json'
           }
       }).then((res) => res.json());
   }

   static sendSurvey(data) {
        return fetch('/api/surveys/create', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify(data)
        });
   }

   static editSurvey(data, surveyKey) {
         return fetch('/api/surveys/'+surveyKey+'/edit', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },

            body: JSON.stringify(data)
        });
  
   }
}

export default SurveyApi;
