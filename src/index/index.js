import './index.scss';
import {
    parseDOMElement,
} from '../utilities/utilities.js';
import modules from './modules.json';

window.onload = () => {
    const buildTime = document.querySelector('.azui span.buildTime');
    buildTime.innerHTML = modules.buildTime;

    const moduleList = document.querySelector('.azui div.moduleList');
    Object.keys(modules.modules).map(m => {
        const mo = modules.modules[m];
        if (mo.type > 0 && mo.type < 4) {
            const moduleTpl = `<div class="modules">
        <h5>${m}</h5>
        <ul></ul>
        </div>`;
            const moduleDOM = parseDOMElement(moduleTpl)[0];

            mo.pages.map(page => {
                const pageLiTpl = `<li><a href='${page}'>${page}</a></li>`
                const pageLi = parseDOMElement(pageLiTpl)[0];
                const ul = moduleDOM.querySelector('ul');
                ul.appendChild(pageLi);
            });

            moduleList.appendChild(moduleDOM);
        }
    });

    // console.log(modules);
};