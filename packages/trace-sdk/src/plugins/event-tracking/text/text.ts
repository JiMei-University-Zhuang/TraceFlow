import { EventTracking } from '..';
import { UserMetricsStore } from '../core/base';

const text = new EventTracking()
console.log(text);
const button = document.getElementById('getAllDataButton');
if (button) {
    button.addEventListener('click', () => {
        console.log('用户输入的数据是',text.getAll());
    });
}