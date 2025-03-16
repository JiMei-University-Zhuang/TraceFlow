//页面停留时间
export const routeList: {
    endTime: number;
    duration: number; 
    startTime: number;
    url: string;
    userId: string; 
}[] = [];
export const routeTemplate = {
    userId:'',
    url:'',
    startTime:0,
    endTime:0,
    duration:0,
}
export function recordNextPage() {
    //记录前一个页面的停留时间
    const time = new Date().getTime();
    routeList[routeList.length-1].endTime = time;
    routeList[routeList.length-1].duration = time - routeList[routeList.length-1].startTime;
    // 推一个页面的停留记录
    routeList.push({
        ...routeTemplate,
        startTime:time,
        url:window.location.pathname,
        duration:0,
        endTime:0,
    })
}

