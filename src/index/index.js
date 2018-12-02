import './index.scss';
import {
    parseDOMElement,
} from '../utilities/utilities.js';
import modules from './modules.json';

window.onload = () => {
    const buildTime = document.querySelector('.azui span.buildTime');
    buildTime.innerHTML = modules.buildTime;

    const moduleList3 = document.querySelector('.azui div.moduleList3');
    const moduleList2 = document.querySelector('.azui div.moduleList2');
    const moduleList1 = document.querySelector('.azui div.moduleList1');

    modules.modules3.map(m => {
        const moduleTpl = `<div class="modules">
        <h5>${m.name}</h5>
        <ul></ul>
        </div>`;
        const moduleDOM = parseDOMElement(moduleTpl)[0];

        m.pages.map(page => {
            const pageLiTpl = `<li><a href='${page}'>${page}</a></li>`
            const pageLi = parseDOMElement(pageLiTpl)[0];
            const ul = moduleDOM.querySelector('ul');
            ul.appendChild(pageLi);
        });

        moduleList3.appendChild(moduleDOM);
    });

    modules.modules2.map(m => {
        const moduleTpl = `<div class="modules">
        <h5>${m.name}</h5>
        <ul></ul>
        </div>`;
        const moduleDOM = parseDOMElement(moduleTpl)[0];

        m.pages.map(page => {
            const pageLiTpl = `<li><a href='${page}'>${page}</a></li>`
            const pageLi = parseDOMElement(pageLiTpl)[0];
            const ul = moduleDOM.querySelector('ul');
            ul.appendChild(pageLi);
        });

        moduleList2.appendChild(moduleDOM);
    });

    modules.modules1.map(m => {
        const moduleTpl = `<div class="modules">
        <h5>${m.name}</h5>
        <ul></ul>
        </div>`;
        const moduleDOM = parseDOMElement(moduleTpl)[0];

        m.pages.map(page => {
            const pageLiTpl = `<li><a href='${page}'>${page}</a></li>`
            const pageLi = parseDOMElement(pageLiTpl)[0];
            const ul = moduleDOM.querySelector('ul');
            ul.appendChild(pageLi);
        });

        moduleList1.appendChild(moduleDOM);
    });

    // console.log(modules);
};