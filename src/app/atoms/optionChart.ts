import { atom, useAtom } from 'jotai';
import {pointList} from  './../constats'

const pointListAtom = atom(pointList);
const optionPriceAtom = atom(100)  //一份期权合约价
const profitOrLossAtom = atom<number|string>(0) // 盈利或者损失价
export {
    pointListAtom,
    optionPriceAtom,
    profitOrLossAtom
} 