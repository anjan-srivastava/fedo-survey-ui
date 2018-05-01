import React from 'react';
import { introJs } from 'intro.js';

var myintro = function (next) {
    setTimeout(() => {
        if (myintro.firstLogin) {

            if (next) {
                introJs()
                    .setOption('doneLabel', 'Next')
                    .setOption('showBullets', false)
                    .onexit(()=> { if (!myintro.noexit) { myintro.firstLogin = false; window.mixpanel.track('Skip Onboading'); }})
                    .start().oncomplete(
                        () => { myintro.noexit = true; myintro.firstLogin = true; window.location.href = '#' + next; }
                    );
            } else {
                // this would be last page of our intro
                // campaign page

                const elem = document.querySelector("[href='#/settings']");
                elem.setAttribute('data-step', '5');
                elem.setAttribute('data-intro', "That's it! You are good to go. You can view this entire feature introduction again from Settings.");

                introJs()
                    .setOption('showBullets', false)
                    .onexit(()=> { myintro.firstLogin = false; elem.removeAttribute('data-intro'); elem.removeAttribute('data-step'); })
                    .oncomplete( () => { window.mixpanel.track('Complete Onboarding') } )
                    .start();

            }
        }
    }, 0);
};

export default myintro;

