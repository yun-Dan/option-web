const enum  colorsEnum{
    maxLost = 'red',
    breakEven = 'black',
    maxProfit = 'green',
    
}
const enum pointKeyEnum {
    maxLost = 'maxLost',
    breakEven = 'breakEven',
    maxProfit = 'maxProfit',
}
const pointList = [
    {
        text:'Max Lost',
        color:colorsEnum.maxLost,
        key:pointKeyEnum.maxLost,
    },
    {
        text:'breakeven',
        color:colorsEnum.breakEven,
        key:pointKeyEnum.breakEven,


    },{
        text:'Max profit',
        color:colorsEnum.maxProfit,
        key:pointKeyEnum.maxProfit,
    }
]


export {
    colorsEnum,
    pointKeyEnum,
    pointList
}