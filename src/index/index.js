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

    const m3 = [];
    const m2 = [];
    const m1 = [];

    modules.modules.map(m => {
        switch (m.type) {
            case 3:
                m3.push(m);
                break;
            case 2:
                m2.push(m);
                break;
            case 1:
                m1.push(m);
                break;
        }
    });

    const sortFunction = (a, b) => a.seq - b.seq;
    m3.sort(sortFunction);
    m2.sort(sortFunction);
    m1.sort(sortFunction);
    // console.log(m3, m2, m1);

    m3.map(m => {
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

    m2.map(m => {
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

    m1.map(m => {
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