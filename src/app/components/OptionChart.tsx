"use client"
import { Stage, Layer, Star, Text, Circle, Line, Shape, Rect } from 'react-konva';
import { atom, useAtom } from 'jotai'
import { pointListAtom,profitOrLossAtom,optionPriceAtom } from "../atoms/optionChart";
import {  useState,useCallback, useMemo } from 'react';
import { colorsEnum,pointKeyEnum } from '../constats';
import React from 'react';

const stageHeight  = 1200;
const stageWidth = 1200;
const headerHeight = 150 // 假设头部的第一条线的y150
const footerHeight = 400  //假设第三条区间线的y是800
const middleHeight = headerHeight + (footerHeight-headerHeight)/2 //中间这条线的y
const lineStartX = 100 //画布中的线开始的x 
const middleLineStartX = lineStartX + 100 //中间线开始的x
//第一条斜率线取中间向下偏离 40px第一条斜率的y slopeLevelHeight ;
const leveDownGap = 40 
const slopeLevelHeight = middleHeight + leveDownGap 
const breakEvenX= (leveDownGap* stageWidth/2) /(slopeLevelHeight-headerHeight) + stageWidth/2 

const  OptionChart =()=> {
    const [pointList, setPointList] = useAtom(pointListAtom);

    const [optionPrice, SetOptionPrice] = useAtom(optionPriceAtom); //购买期权花的钱
    //盈利的价格
    const [profitOrLoss,setProfitOrLoss] = useAtom(profitOrLossAtom)

    const [activePoint, setActivePoint ] = useState<pointKeyEnum|null>()
    const [isPointTextActive,setIsPointTextActive] = useState(false)
    //垂直线的圆圈位置
    const [upLineCirclePostion, setUpLineCirclePosition] = useState({
      x:0,
      y:0
    })
    //垂直线的位置
    const [upLinePostionPoints,setUpLinePositionPoints] = useState([0,0,0,0])

    //三个点points的位置
    const [markPointsPosition,setMarkPointsPosition]= useState({
      [pointKeyEnum.maxLost]:{
        x:stageWidth/2,
        y:slopeLevelHeight,
        profit:-optionPrice
      },
      [pointKeyEnum.breakEven]:{
        x: breakEvenX,
        y:middleHeight,
        profit:0
      },
      [pointKeyEnum.maxProfit]:{
        x:stageWidth,
        y:headerHeight,
        profit:'UNLIMITED'
      }
    })

    //根据鼠标移动垂直线
    const moveUpLineAndCircle = (x: number,y: number)=>{
      //线条上的circle
      const upLineStartX =  x<= middleLineStartX ? middleLineStartX : x 
        setUpLineCirclePosition({
          x: upLineStartX,
          y
        });
      setUpLinePositionPoints([ upLineStartX,headerHeight,upLineStartX,footerHeight])
      calcProfitOrLoss(x,y)
      setActivePoint(markPoint(x,y))
    }

  

    //根据鼠标在关键点变大points  并让价格变成关键点
    const markPoint = (x:number,y:number)=>{
      const gap = 10
      let point = null;
      Object.entries(markPointsPosition).forEach(([key,{ x: markPointX,profit}])=>{
        if(Math.abs(markPointX - x) < gap){
          point = key
          setProfitOrLoss(profit)
          setIsPointTextActive(true)
        }else{
          setIsPointTextActive(false)
        }
      })
      return point
      
    }
    // 计算盈利或者损失价格 
    const calcProfitOrLoss = (x: number,y: number)=>{
      //计算出开始损失(原点)到最大损失点 x的距离； 得出1px 大约多少钱
      const maxLostDistance =  markPointsPosition.breakEven.x - markPointsPosition.maxLost.x ;
      const unitPxToPrice = (+ optionPrice / maxLostDistance).toFixed(2)
      if(x <=  markPointsPosition.maxLost.x){
        setProfitOrLoss(-optionPrice)
      }else{
        const profit = -optionPrice + (x-markPointsPosition.maxLost.x)* +unitPxToPrice
        setProfitOrLoss(profit)
      }
    }
    const displayProfitOrLossDetail = ()=>{
      if(profitOrLoss === 'UNLIMITED'){
        return {
          text:'unlimited',
          color:colorsEnum.maxProfit
        }
      }
      const profitOrLossDic = {
        '+':{
          text:`+$${profitOrLoss}`,
          color:colorsEnum.maxProfit 
        },
        '-':{
          text:`-$${-profitOrLoss}`,
          color:colorsEnum.maxLost
        },
        0:{
          text:'$0.00',
          color:colorsEnum.breakEven 
        }
      }
      return +profitOrLoss > 0? profitOrLossDic['+']:+profitOrLoss<0?profitOrLossDic['-']:profitOrLossDic[0]
    }
    
    //区间线
    const drawIntervalLine = useCallback(()=>{
      return (
        <>
        <Line points={[lineStartX, headerHeight, stageWidth, headerHeight]} dash={[3]} strokeWidth={1} fillPatternRepeat='x' lineJoin="round" lineCap='round' stroke={colorsEnum.breakEven}></Line>
         <Line points={[middleLineStartX, middleHeight, stageWidth,middleHeight]} strokeWidth={1} fillPatternRepeat='x' stroke={colorsEnum.breakEven}></Line>
        <Line points={[lineStartX, footerHeight, stageWidth, footerHeight]} dash={[3]} strokeWidth={1} fillPatternRepeat='x' lineJoin="round" lineCap='round' stroke={colorsEnum.breakEven}></Line>
        </>
      )
    },[])
    //变化斜率线 
    const drawSlopeLine = useCallback(()=>{
      return (
        <>
          <Line points={[middleLineStartX, slopeLevelHeight, stageWidth/2, slopeLevelHeight,breakEvenX,middleHeight]} strokeWidth={2} fillPatternRepeat='x' stroke={colorsEnum.maxLost}></Line>
          <Line points={[breakEvenX, middleHeight, stageWidth, headerHeight]} strokeWidth={2} fillPatternRepeat='x' stroke={colorsEnum.maxProfit}></Line>
        </>
      )
    },[])
    //红绿区域填充背景
    const drawFillBgColor = useCallback(()=>{
      const bgPoints ={
        [colorsEnum.maxProfit]:[[breakEvenX, middleHeight],[stageWidth, middleHeight],[stageWidth, headerHeight]],
        [colorsEnum.maxLost ]:[[middleLineStartX, slopeLevelHeight],[stageWidth/2, slopeLevelHeight],[breakEvenX, middleHeight],[middleLineStartX, middleHeight]],
      }
      return Object.entries(bgPoints).map(([key,[[x,y],...arearArr]])=>{
        return <Shape
            key={key}
            sceneFunc={(context, shape) => {
              context.beginPath();
              context.moveTo(x, y); // 开始点
              arearArr.forEach(([x,y])=>{
                context.lineTo(x, y)
              })
              context.closePath(); // 封闭多边形路径
              context.fillStrokeShape(shape); // 填充多边形并描边
            } }
          opacity={0.3}
          fill={key} // 填充颜色
          strokeWidth={2} // 描边宽度
        />
   
      })
    },[])
  
    //垂直线的部分
    const drawVerticalLinePart = ()=>{
      return (
        <>
            <Line points={upLinePostionPoints} strokeWidth={2} fillPatternRepeat='x' stroke={colorsEnum.breakEven}></Line>
            <Circle width={50} fill={colorsEnum.maxProfit} x={upLineCirclePostion.x} y={middleHeight} opacity={0.5}  stroke={colorsEnum.maxProfit} strokeWidth={1}  strokeEnabled ></Circle>
            <Circle width={80}  x={upLineCirclePostion.x} y={middleHeight} opacity={0.5}  stroke={colorsEnum.maxProfit} strokeWidth={1}  strokeEnabled  ></Circle>
        </>
      )
    }

    //三个点
    const drawMainPoints = useCallback(()=>{
        return Object.entries(markPointsPosition).map(([key ,{x,y}])=>{
          return <Circle key={key}  width={activePoint=== key ?32:16} fill={colorsEnum[key] } x={x} y={y}    strokeEnabled ></Circle>
        })
    },[activePoint, markPointsPosition])

    const drawFooter =useCallback( ()=>{
      return pointList.map((item,index)=>{
        return (
          <React.Fragment key={item.key}>
            <Circle key={item.key} width={10} fill={item.color} absolutePosition={{ x: 320 + index * 200, y: footerHeight + 50 }}></Circle>
            <Text  key={item.key+'text'} text={item.text} fontSize={20}  absolutePosition={{ x: 320 + index *200 + 20 , y: footerHeight + 40 }}   />
          </React.Fragment>

        )
      })
    },[pointList])

    return (
        <Stage width={stageWidth} height={stageHeight} className='text-pink cursor-pointer' onMouseMove={(event)=>{
          if(event && event.target && event.target.getStage){
            const { x, y } = event.target.getStage()?.getPointerPosition()??{x:0,y:0};
            moveUpLineAndCircle(x,y)
          }
     
        }}>   
            <Layer>
              <Text text="Expected Profit & Loss"  fontSize={32} x={stageWidth/2 - 140} y={16}/>
              <Text text={displayProfitOrLossDetail().text}  fontSize={32}  x={stageWidth/2 -30} y={74} fill={displayProfitOrLossDetail().color}   />
              {/* 区间线 */}
              {drawIntervalLine()}
              {/* 变化线 */}
              {drawSlopeLine()}
              {/* //填充的颜色 */}
              {drawFillBgColor()}



              {/* 竖直线 */}
              {drawVerticalLinePart()}
              {/* 橙色的circle和绿色的circle和黑色 */}
              {drawMainPoints()}
              <Text
                text="- 0 +"
                x={middleLineStartX - 60} // 文字的起始 x 坐标
                y={middleHeight + 60} // 文字的起始 y 坐标
                fontSize={32} // 文字的字号
                letterSpacing={16}
                fill={colorsEnum.breakEven} // 文字的颜色
                rotation={-90} // 文字的旋转角度，负数表示逆时针旋转
                fontStyle="bold" // 文字的样式，例如 bold、italic 等
              />
              {/* 底部footer */}
              {drawFooter()}
          </Layer>
        </Stage>
    );
  }

  export default OptionChart;
