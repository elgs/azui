import './index.scss';
import modules from './modules.json';

window.onload = () => {
    const buildTime = document.querySelector('span.buildTime');
    buildTime.innerHTML = modules.buildTime;


    console.log(modules);
};